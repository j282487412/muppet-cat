const AccountDao = require('../dao/AccountDao')

class AccountService extends BaseService {
    constructor() {
        super();
        this.dao = AccountDao;
    }



}
module.exports = new AccountService();