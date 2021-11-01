const path = require('path')
module.exports = {
    root: path.join(__dirname, '../../views'),
    layout: 'layout',
    viewExt: 'ejs',
    cache: false,
    debug: false,
};