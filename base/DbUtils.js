const { Sequelize, DataTypes } = require('sequelize');
if (!Sequelize.prototype.import) Sequelize.prototype.import = function (name) { return require(name)(this, DataTypes); }
const dbConfigTmp = {
    username: 'root',
    password: '123456',
    database: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
    timezone: '+08:00',
    pool: {
        max: 50,
        min: 0,
        idle: 60000,
    },
    dialectOptions: {
        dateStrings: true,
        typeCast: true
    },
};

class DbUtils {
    isConnected = false;
    #logger;
    #option;
    constructor(option) {
        if (!option.timezone) option.timezone = dbConfigTmp.timezone
        if (!option.pool) option.pool = dbConfigTmp.pool
        if (!option.pool.max) option.pool.max = dbConfigTmp.pool.max
        if (!option.pool.min) option.pool.min = dbConfigTmp.pool.min
        if (!option.pool.idle) option.pool.idle = dbConfigTmp.pool.idle
        if (!option.dialectOptions) option.dialectOptions = dbConfigTmp.dialectOptions
        if (!option.dialectOptions.dateStrings) option.dialectOptions.dateStrings = dbConfigTmp.dialectOptions.dateStrings
        if (!option.dialectOptions.typeCast) option.dialectOptions.typeCast = dbConfigTmp.dialectOptions.typeCast
        option.logging = (sql) => {
            if (!this.#logger) this.#logger = getLogger('databases');
            this.#logger.trace(sql);
        };
        this.#option = option;
        // this.Connect();
    }

    async Connect() {
        try {
            this.sequelize = new Sequelize(this.#option.database, this.#option.username, this.#option.password, this.#option);
            await this.sequelize.authenticate();
            this.isConnected = true;
        } catch (error) {
            this.#logger.error(error);
            setTimeout(async function () {
                await this.Connect();
            }, 1000)
        }
    }
}
module.exports = DbUtils;