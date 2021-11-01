"use strict";
const Koa = require('koa');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const crypto = require('crypto');

require('./lib/util');
const DbUtils = require('./base/DbUtils');

const exp = require('./common/KoaExpand');
const { BaseError, ResponBean } = require('./base/BaseError');

global.BaseError = BaseError;
global.ErrorCode = ResponBean;

global.BaseDao = require('./base/BaseDao');
global.BaseService = require('./base/BaseService');
global.BaseController = require('./base/BaseController');
global.muppet = { muppetConfig: {} };

global.getPwd = function (pwd) {
    var obj = crypto.createHash(muppet.config.initPwdEnc);
    obj.update(pwd);
    const str = obj.digest('hex')
    return str;
}

function readConfig() {
    //加载主配置
    const env = require(path.resolve(process.cwd(), 'config/local')).env
    const configPath = path.resolve(process.cwd(), `config/env/${env || 'default'}.js`);
    if (fs.existsSync(configPath)) {
        muppet.config = require(configPath);
    } else {
        throw new Error(`can\`t found this config file ${configPath} !`);
    }
    muppet.LaterConfig = [];
    //获取延后读取配置清单
    if (fs.existsSync(path.resolve(process.cwd(), 'config/Delay.js'))) {
        const later = require(path.resolve(process.cwd(), 'config/Delay')).map(c => path.resolve(process.cwd(), 'config', c + '.js'));
        muppet.LaterConfig = later;
    }
    //加载其他配置文件
    const files = readFiles(path.resolve(process.cwd(), 'config'), true);
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (/\.js$/.test(files[i])) {
            if (!muppet.LaterConfig.includes(f)) {
                const r = require(f);
                const key = path.basename(f).replace(path.extname(f), '')
                muppet.muppetConfig[key] = r;
            }
        }
    }
}

async function loadDelay() {
    for (let i = 0; i < muppet.LaterConfig.length; i++) {
        const f = muppet.LaterConfig[i];
        const r = require(f);
        const key = path.basename(f).replace(path.extname(f), '')
        muppet.muppetConfig[key] = r;
    }
}

function setLogger() {
    const option = { logPath: path.resolve(process.cwd(), './logs/'), level: muppet.muppetConfig.log.level || 'debug' };
    if (muppet.muppetConfig.log && muppet.muppetConfig.log.path) option.logPath = muppet.muppetConfig.log.path;
    if (muppet.muppetConfig.log && muppet.muppetConfig.log.level) option.level = muppet.muppetConfig.log.level;
    require('./common/logger')(option);
}

async function connectDb() {
    if (muppet.muppetConfig.Mysql.host) {
        muppet.db = new DbUtils(muppet.muppetConfig.Mysql);
        await muppet.db.Connect();
    }
}

function readApiFile(Filepath) {
    const option = {};
    const files = readFiles(path.resolve(process.cwd(), Filepath));
    for (let i = 0; i < files.length; i++) {
        if (/\.js$/.test(files[i])) {
            const f = files[i];
            const r = require(f);
            const key = r.__proto__.constructor.name
            option[key] = r;
        }
    }
    return option;
}

async function connectRedis() {
    if (muppet.muppetConfig.Redis.host) {
        const redisUtil = require('./common/redis')
        muppet.redisClient = await redisUtil.connect(muppet.muppetConfig.Redis);
    }
}

async function loadModels() {
    muppet.models = {};
    const logger = getLogger('loadModels')
    const files = readFiles(path.resolve(process.cwd(), 'models'));
    for (let i = 0; i < files.length; i++) {
        if (/\.js$/.test(files[i])) {
            const model = muppet.db.sequelize.import(files[i]);
            const key = path.basename(files[i]).replace(path.extname(files[i]), '')
            muppet.models[key] = model;
        }
    }
    if (muppet.config.syncdb == true) {
        const t = await muppet.db.sequelize.transaction();
        try {
            await muppet.db.sequelize.sync({ alter: true, transaction: t });
            await t.commit();
        } catch (error) {
            logger.error(error.stack);
            await t.rollback();
        }

    }
}

async function initData() {
    if (muppet.config.initData) {
        const datas = require(path.resolve(process.cwd(), 'models/data/data.js'))
        for (let i = 0; i < datas.length; i++) {
            const d = datas[i];
            const data = d.data;
            if (d.db == 'hnebAccount') {
                data.forEach(ele => {
                    ele.Password = getPwd(ele.Password);
                });
            }
            await muppet.models[d.db].bulkCreate(data, { validate: true, updateOnDuplicate: ['UpdatedBy', 'UpdatedTime', 'RecordState'] });
        }
    }
}

async function initConfigFile() {
    //加载配置文件
    readConfig();
    //设置日志
    setLogger();
    //链接数据库
    await connectDb();
    //加载Model
    await loadModels();
    //加载控制层文件
    muppet.controller = await readApiFile(muppet.config.controllersDir || 'api/*/controllers');
    //加载延迟配置文件
    await loadDelay();
    //连接Redis
    await connectRedis();
    //初始化数据
    await initData();
}

async function startListen() {
    const logger = getLogger('muppet')
    const app = new Koa();
    muppet.app = app;
    app.keys = [uuid.v4()];
    //按配置顺序包装
    if (muppet.muppetConfig.http.http.middleware.order) {
        let funName = muppet.muppetConfig.http.http.middleware.order.shift();
        while (funName != null) {
            if (typeof funName == 'string') {
                if (funName == 'router') {
                    exp[funName](app, muppet.muppetConfig.http.http.middleware.order);
                    funName = null;
                } else {
                    exp[funName](app);
                    funName = muppet.muppetConfig.http.http.middleware.order.shift()
                }
            } else if (typeof funName == 'function') {
                await funName(app);
                funName = muppet.muppetConfig.http.http.middleware.order.shift()
            }
        }
    }
    if (muppet.config.httpPort) {
        http.createServer(app.callback()).listen(muppet.config.httpPort, () => {
            logger.info(`http server started: http://localhost:${muppet.config.httpPort}`);

        });
    }
    if (muppet.config.httpsPort) {
        https.createServer(muppet.config.ssl, app.callback()).listen(muppet.config.httpsPort, () => {
            logger.info(`https server started: https://localhost:${muppet.config.httpsPort}`);
        });
    }
}

async function start() {
    await initConfigFile();
    await startListen();
}

module.exports = { start, };