const fs = require('fs')
const path = require('path')
const FILE_BASE = '/mnt/sdb';
const appName = 'cms-server-xingzhen';

module.exports = {
    httpPort: 9002,
    httpsPort: 7922,
    FILE_BASE,
    syncdb: true,
    appName,
    initPwdEnc: 'md5',
    initData: false,
    controllersDir: 'api/controllers',
    ssl: {
        requestCert: false,
        rejectUnauthorized: false,
    },
}