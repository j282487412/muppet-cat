const UserService = require('../services/UserService')

class UserController {

    async read(ctx) {
        const result = await UserService.read(1, 2, 3, 4);
        ctx.body = { code: 200, result }
    }

    async none_details(ctx) {
        ctx.session.user.UserName = '123';
        ctx.session.user.UserId = '123';
        ctx.body = { code: 200 }
    }
}
module.exports = new UserController();