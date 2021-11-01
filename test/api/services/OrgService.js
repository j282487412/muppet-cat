const OrgDao = require('../dao/OrgDao')

class OrgService extends BaseService {
    constructor() {
        super();
        this.dao = OrgDao;
    }



}
module.exports = new OrgService();