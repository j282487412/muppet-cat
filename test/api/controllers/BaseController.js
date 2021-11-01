const AuthService = require('../services/AuthService')


class BaseController {

    async login(ctx) {
        
        const loginData = await AuthService.login();
        ctx.body = { code: 200 }
    }

    async logout(ctx) {
        
    }
}
module.exports = new BaseController();