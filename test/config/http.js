module.exports.http = {
  middleware: {
    order: [
      'cors',
      'proxy',
      'statics',
      'cache',
      'httpLog',
      'bodyParser',
      'sqlInjection',
      // function (app) {
      //   app.use(async (ctx, next) => {
      //     console.log(ctx.request.body);
      //     await next();
      //     console.log(ctx.body)
      //   });
      // },
      'cookieParser',
      'session',
      'BaseCatch',
      'sessionCheck',
      'www',
      'router',
    ],


  },
};
