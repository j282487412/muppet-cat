const proxyMiddleware = require('koa2-proxy-middleware');
const koaRouter = require('koa-router')();
const uuid = require('uuid');

function cors(app) {
    if (muppet.muppetConfig.security) {
        app.use(require('koa2-cors')({
            origin: (ctx) => {
                return muppet.muppetConfig.security.cors || '*';
            },
            exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
            maxAge: 5,
            credentials: true,
            allowMethods: ['GET', 'POST', 'DELETE'],
            allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
        }));
    }
}

function proxy(app) {
    if (muppet.muppetConfig.proxy) app.use(proxyMiddleware(muppet.muppetConfig.proxy));
}

function statics(app) {
    if (muppet.muppetConfig.statics && !Array.isArray(muppet.muppetConfig.statics)) {
        for (const key in muppet.muppetConfig.statics) {
            app.use(require('koa-mount')(key, require('koa-static')(muppet.muppetConfig.statics[key])));
        }
    }
}

function cache(app) {
    app.use(require('koa-compress')(muppet.muppetConfig.cache));
    app.use(require('koa-conditional-get')());
    app.use(require('koa-etag')());
}

function httpLog(app) {
    app.use(async (ctx, next) => {
        const start = new Date();
        const req = ctx.request;
        let [ms, logMsg] = [null, null];
        let ip;
        if (req.ip == '::1') ip = 'localhost'
        else ip = req.ip.split(':')[3];
        try {
            await next();
            ms = new Date() - start;
            logMsg = `${req.method}\treplied in:${ms}ms\t${req.path}\tfrom: ${ip}\twith query: ${JSON.stringify(req.body)}.`
            getLogger('http').debug(logMsg);
        } catch (error) {
            ms = new Date() - start;
            logMsg = `${req.method}\treplied in:${ms}ms\t${req.path}\tfrom: ${ip}\twith query: ${JSON.stringify(req.body)}.`
            getLogger('http').error(logMsg, error.stack);
        }
    });
}

function bodyParser(app) {
    if (!muppet.muppetConfig.bodyParser) muppet.muppetConfig.bodyParser = {
        multipart: true,
        maxFieldsSize: 1024 * 1024 * 1024,
        jsonLimit: '50mb',
    };
    app.use(require('koa-body')(muppet.muppetConfig.bodyParser));
    app.use(async (ctx, next) => {
        if (typeof ctx.request.body === 'string' && /^(\{|\[)/.test(ctx.request.body)) {
            try {
                ctx.request.body = JSON.parse(ctx.request.body);
            } catch (error) {
                ctx.body = { code: 503, message: '参数解析错误！' };
                return;
            }
        } else if (ctx.request.body && ctx.request.body.fields && ctx.request.body.files) {
            ctx.request.files = ctx.request.body.files;
            ctx.request.body = ctx.request.body.fields;
        }
        if (!ctx.request.body) ctx.request.body = {};
        for (const key in ctx.query) {
            ctx.request.body[key] = ctx.query[key];
        }
        await parseChildrenField(ctx.request.body);
        await next();
    });

    async function parseChildrenField(m) {
        for (const key in m) {
            if (typeof m[key] === 'string') {
                if (/^{/.test(m[key]) || /^\[/.test(m[key])) {
                    m[key] = m[key].toJSON();
                    await parseChildrenField(m[key]);
                }
            }
        }
    }

    app.use(async (ctx, next) => {
        const type = ctx.header['content-type']
        if (type && type.toUpperCase().indexOf('VIID+JSON') != -1) {
            const datas = await parseVVIDParam(ctx);
            for (const key in datas) {
                ctx.request.body[key] = datas[key];
            }
        }
        await next();
    })

    async function parseVVIDParam(ctx) {
        return new Promise(function (resolve, reject) {
            let data = '';
            ctx.req.addListener('data', (postDataChunk) => {
                data += postDataChunk.toString();
            })
            ctx.req.addListener('end', () => {
                if (/^\{\"0\"\:\"{\",\"1\":\"/.test(data) || /^\[\"0\"\:\"{\",\"1\":\"/.test(data)) {
                    const list = [];
                    data = JSON.parse(data);
                    for (const k in data) {
                        if (require('validator').isInt(k)) list.push(data[k]);
                    }
                    data = JSON.parse(list.join(''))
                } else {
                    data = data.toJSON();
                }
                resolve(data)
            })
        });
    }

}

function sqlInjection(app) {
    app.use(async (ctx, next) => {
        await parseChildrenField(ctx.request.body);
        await next();
    });

    async function parseChildrenField(m) {
        for (const key in m) {
            if (typeof m[key] === 'string') {
                m[key] = escapeString(m[key])
            } else if (typeof m[key] === 'object') {
                await parseChildrenField(m[key]);
            }
        }
    }
}

function escapeString(val) {
    const r = "(?:')|(?:--)|(/\\*(?:.|[\\n\\r])*?\\*/)|(\\b(select|update|union|and|or|delete|insert|trancate|char|into|substr|ascii|declare|exec|count|master|into|drop|execute)\\b)";
    const ex = new RegExp(r);
    if (ex.test(val)) {
        return muppet.db.sequelize.escape(val);
    }
    return val;
}

function cookieParser(app) {
    app.use(async (ctx, next) => {
        let cok = ctx.request.header.token || ctx.request.header.authorization || ctx.query.token || ctx.cookies.get(`${(muppet.muppetConfig.session.secret || 'ebang_session:')}uid`);
        if (/^Bearer/.test(cok)) cok = cok.substr(7);
        if (!cok) {
            cok = uuid.v4();
            ctx.cookies.set(`${(muppet.muppetConfig.session.secret || 'ebang_session:')}uid`, cok, { httpOnly: false })
        }
        ctx.cookiesKey = cok;
        await next();
    });
}

function session(app) {
    app.use(async (ctx, next) => {
        ctx.session = {};
        let key = (muppet.muppetConfig.session.secret || 'ebang_session:') + ctx.cookiesKey;
        const json = JSON.parse(await muppet.redisClient.getAsync(key));
        ctx.session = json;
        if (!json) ctx.session = { guest: true, user: { UserName: '游客' } }
        ctx.session.cok = ctx.cookiesKey;
        await next();
        await muppet.redisClient.setAsync(key, JSON.stringify(ctx.session))
        await muppet.redisClient.expireAsync(key, 5 * 60);
    });
}

function BaseCatch(app) {
    const logger = getLogger('Catch');
    app.use((ctx, next) => next().catch((err) => {
        if (err instanceof BaseError) {
            delete err.stack;
            ctx.body = err;
        } else {
            logger.error(err.stack);
            ctx.status = 500;
            ctx.body = '系统错误';
        }
    }));
}

function sessionCheck(app) {
    app.use(async (ctx, next) => {
        if (ctx.session.user.UserId || muppet.muppetConfig.public.filter(e => e.test(ctx.path)).length > 0) {
            await next();
        } else {
            ErrorCode.Session();
        }
    });
}

function www(app) {
    if (muppet.muppetConfig.view) {
        require('koa-ejs')(app, muppet.muppetConfig.view);
        app.context.render = require('co').wrap(app.context.render);
    }
}

const httpMethods = new RegExp(/^((GET|POST|DELETE|PUT){1})\s+(\/.*)/i);
function router(app, otherFuns) {
    const logger = getLogger('registerInterface');
    const controllers = muppet.controller;
    const list = {};
    for (const fileNameOnly in controllers) {
        const controller = controllers[fileNameOnly];
        const funs = Object.getOwnPropertyNames(controller.__proto__).filter((cur) => cur != 'constructor').map((cur) => { return { name: cur, fun: controller[cur] } });
        funs.forEach(f => {
            let key = f.name;
            const fun = f.fun;
            const kmatch = key.match(/(\$)/);
            const klen = kmatch ? kmatch.length : 0;
            for (let i = 0; i < klen; i++) {
                key = key.replace('$', ':param' + (i + 1));
            }
            let [method, url] = ['POST', null];
            var ms = key.toUpperCase().split('_');
            if (!(ms.length == 1 && ms[0] == 'DELETE') && ['GET', 'POST', 'DELETE', 'PUT', 'NONE', 'ALL', 'DEL'].includes(ms[0])) method = ms[0];
            url = ms.join('/').replace(/^(POST|GET|DEL|PUT|NONE|ALL|DELETE)\//, '').toLowerCase();
            if (method != 'NONE') {
                const m = fileNameOnly.toUpperCase().replace(/CONTROLLER.*/, '').toLowerCase();
                let apiUrl = `/api/${url}`;
                if (m != 'base') {
                    apiUrl = `/api/${m}/${url}`;
                }
                list[apiUrl] = { fun, method, to: `${fileNameOnly}.${key}` };
            }
        });
    }
    const otherRouters = muppet.muppetConfig.routes;
    if (otherRouters) {
        for (const routeConfig in otherRouters) {
            const fun = otherRouters[routeConfig];
            let [method, url] = ['all', null];
            if (httpMethods.test(routeConfig)) {
                [, method, , url] = routeConfig.match(httpMethods);
            } else {
                url = routeConfig;
            }
            if (url && typeof fun === 'function') {
                list[url] = { fun, method, to: `${fun.name}` };
            }
        }
    }
    for (const key in list) {
        const { fun, method, to } = list[key]
        for (const f of otherFuns) {
            koaRouter[method.toLowerCase()](key, f);
        }
        koaRouter[method.toLowerCase()](key, fun);
        logger.trace(`mounting route: ${method} ${key} to ${to}`);
    }
    app.use(koaRouter.routes()).use(koaRouter.allowedMethods());
}

module.exports = { cors, proxy, statics, cache, httpLog, bodyParser, cookieParser, session, BaseCatch, sessionCheck, www, router, sqlInjection }