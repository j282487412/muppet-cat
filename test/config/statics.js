const path = require('path')
module.exports = {
    '/': path.resolve(__dirname, '../../dist'),
    '/doc': path.resolve(__dirname, '../../doc'),
    '/files': path.resolve(muppet.config.FILE_BASE, './files')
}