class BaseService {
    constructor() {
        for (const key of Object.getOwnPropertyNames(this.__proto__)) {
            if (key != 'constructor') {
                const fun = this[key];
                const that = this;
                this[key] = async function () {
                    const args = Array.prototype.slice.call(arguments); // 剩余的参数转为数组
                    const context = args[0]; // 保存需要绑定的this上下文
                    const t = await muppet.db.sequelize.transaction();
                    args.push(t)
                    try {
                        const result = await fun.apply(context, args);
                        await t.commit();
                        return result;
                    } catch (err) {
                        await t.rollback();
                        if (err instanceof BaseError) {
                            throw err;
                        } else {
                            ErrorCode.BASEERROR();
                        }
                    }
                }
            }
        }
    }
}

module.exports = BaseService;