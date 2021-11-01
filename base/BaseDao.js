class BaseDao {
    db; #model;
    constructor(modelName) {
        this.db = muppet.db;
        this.#model = muppet.models[modelName];
    }

    async readAll(condition) {
        const result = await this.#model.findAll({ where: condition });
        return result;
    }

    async readById(id) {
        const result = await this.#model.findAll({ where: { [this.#model.primaryKeyAttribute]: id } });
        return result;
    }

    async readAndCount(where, limit, offset) {
        const result = await this.#model.findAndCountAll({ where, limit, offset })
        return result;
    }

    async readByAllSql(sql, paramsSql, conditions, sort, pageIndex, pageSize) {

    }

    async readBySql(sql, paramsSql, conditions, order, sort) {

    }

}

module.exports = BaseDao;