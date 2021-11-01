const util = require('util')
const validator = require('validator')
class BaseError {
    constructor(code, message, data) {
        Error.call(this);
        Error.captureStackTrace(this);
        this.message = message;
        this.code = code;
        this.data = data;
    }
}
util.inherits(BaseError, Error);

class ResponBean {
    OK(param) {
        if (typeof param == 'string') throw new BaseError(200, param)
        else if (typeof param == 'object') throw new BaseError(200, '操作成功', param)
        else if (param == null) throw new BaseError(200, '操作成功')
    }
    miss(model) {
        for (const key in model) {
            if (!model[key]) {
                throw new BaseError(400, `缺少关键字段:${key}`)
            }
        }
    }
    Int(model) {
        for (const key in model) {
            if (model[key] && !validator.isInt(`${model[key]}`)) {
                throw new BaseError(401, `${key} - 参数必须是整型: ${model[key]}`)
            }
        }
    }
    LockError(msg) {
        throw new BaseError(402, msg || '密码错误次数过多，您的机器已被锁定!')
    }
    PWDError(msg) {
        throw new BaseError(402, msg || '密码错误!')
    }
    RoleError(msg) {
        throw new BaseError(402, msg || '该机器无使用本应用权限！')
    }
    Session() {
        throw new BaseError(403, 'SESSION 已失效')
    }
    Param(msg) {
        throw new BaseError(404, msg || '参数错误')
    }
    Validcode(msg) {
        throw new BaseError(405, msg || '验证码错误')
    }
    BASEERROR(msg) {
        throw new BaseError(500, msg || '数据库操作失败！')
    }
    paramslogic(msg) {
        throw new BaseError(406, msg || '参数逻辑错误！')
    }
    UrlError(msg) {
        throw new BaseError(407, msg || '错误的请求地址')
    }
    unique(msg) {
        throw new BaseError(408, msg || '数据有重复')
    }
    OpenId(msg) {
        throw new BaseError(409, msg || '找不到绑定的帐号')
    }
    Http(msg) {
        throw new BaseError(410, msg || '本接口不支持Http方式请求')
    }
}

module.exports = { BaseError, ResponBean: new ResponBean() };