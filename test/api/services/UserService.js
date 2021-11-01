const UserDao = require('../dao/UserDao')

class UserService extends BaseService {
    constructor() {
        super();
        this.dao = UserDao;
    }
    async read(a, b, c, d, e, f, g) {
        return (await UserDao.readAll());
    }
}
module.exports = new UserService();