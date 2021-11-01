const path = require('path');
const log4js = require('log4js');

/**
 * 初始化日志
 * @param {Object} option 配置
 * @param {String} option.logPath 日志存放全路径
 * @param {String} option.level 日志保存/打印级别
 */
module.exports = function (option) {
    checkAndMkdir(option.logPath);
    log4js.configure({
        appenders: {
            out: {
                type: 'console',
                layout: {
                    type: 'pattern',
                    pattern: '%[[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c - %m ',
                },
            },
            log: {
                type: 'file',
                filename: path.join(option.logPath, 'log.log'),
                pattern: '.yyyy-MM-dd',
                compress: true,
                backups: 5,
                alwaysIncludePattern: true,
                layout: {
                    type: 'pattern',
                    pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c - %m ',
                },
            },
        },
        categories: {
            default: {
                appenders: ['out', 'log'],
                level: option.level,
                enableCallStack: true,
            },
        },
        replaceConsole: true, // 以[INFO] console代替console默认样式
        pm2: true,
        disableClustering: true,
    });
}

global.getLogger = (logTitle) => {
    const logger = log4js.getLogger(logTitle || 'app');
    return logger;
};