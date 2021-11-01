const OrgDao = require('../dao/OrgDao')
const UserDao = require('../dao/UserDao')

class AuthService extends BaseService {
    constructor() {
        super();
        this.dao = OrgDao;
    }

    async login() {
        
    }

}
module.exports = new AuthService();