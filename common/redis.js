const Promise = require('bluebird');
const redis = Promise.promisifyAll(require('redis'));
const logger = getLogger('redis');

class RedisClient {
    constructor() {
        this.redisClient;
        this.canConnect = false;
    }
    async connect(options) {
        await this.connectRedis(options);
        setInterval(async () => {
            await client.pingRedis();
        }, 10 * 1000);
        setInterval(async () => {
            if (client.canConnect) {
                await client.connectRedis(options);
            }
        }, 10 * 1000);
        return this.redisClient;
    }

    async connectRedis(option) {
        option.retry_strategy = function (options) {
            if (options.error.code === 'ECONNREFUSED') {
                client.redisClient.quit();
                client.canConnect = true;
                logger.warn('连接被拒绝');
            }
            if (options.times_connected > 10) logger.warn('重试连接超过十次');
            return Math.max(options.attempt * 100, 3000);
        }
        logger.trace('连接redis host:%s,port:%s····', option.host, option.port);
        this.redisClient = redis.createClient(option);
        this.redisClient.on('connect', (e) => {
            logger.trace('连接redis成功：host:%s,port:%s', option.host, option.port);
        });
        this.redisClient.on('error', (e) => {
            this.redisClient.quit();
            this.canConnect = true;
        });
        this.redisClient.on('close', () => {
            this.canConnect = true;
        });
        this.canConnect = false;

    }

    async pingRedis() {
        let r = await this.redisClient.ping();
        if (!r) this.canConnect = true;
    }
}
const client = new RedisClient()

module.exports = client;