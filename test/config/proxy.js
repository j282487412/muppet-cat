module.exports = {
    targets: {
        // '/proxy/(.*)': {
        //     target: muppet.config.GB_HTTP_SERVER,
        //     changeOrigin: true,
        //     secure: false,
        //     proxyTimeout: 1000 * 60 * 2,
        //     timeout: 1000 * 60 * 2,
        //     pathRewrite: {
        //         '^/proxy/': '/',
        //     },
        //     logLevel: 'debug',
        //     logProvider: function () {
        //         var proxyLog = getLogger('proxy');
        //         return proxyLog
        //     }
        // },
        // '/hneb/(.*)': {
        //     target: 'http://58.20.6.136:8852/',
        //     changeOrigin: true,
        //     secure: false,
        //     proxyTimeout: 1000 * 60 * 2,
        //     timeout: 1000 * 60 * 2,
        //     pathRewrite: {
        //         '^/hneb/': '/hneb/',
        //     },
        //     logLevel: 'debug',
        //     logProvider: function () {
        //         var proxyLog = getLogger('proxy');
        //         return proxyLog
        //     }
        // },
    }
}