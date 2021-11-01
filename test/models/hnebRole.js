const { Sequelize, DataTypes, UUIDV4 } = require("sequelize");

module.exports = function (sequelize) {
    return sequelize.define('hnebRole', {
        RoleId: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, comment: '角色ID', },
        RoleName: { type: DataTypes.STRING(64), allowNull: false, comment: '角色名称' },
        Description: { type: DataTypes.TEXT, comment: '角色描述' },

        RoleCode: { type: DataTypes.STRING(8), allowNull: false, comment: '代码' },
        ParentId: { type: DataTypes.UUID, references: { model: 'hneb_Role', key: 'RoleId', }, comment: '上级角色', },
        RoleTree: { type: DataTypes.TEXT, allowNull: false, comment: '树代码', },

        RecordState: { type: DataTypes.ENUM, values: ['A', 'D', 'R'], allowNull: false, defaultValue: 'A', comment: '记录状态: A-有效, D-禁用, R-逻辑删除', },
        CreatedBy: { type: DataTypes.UUID, comment: '记录创建者帐号', },
        UpdatedBy: { type: DataTypes.UUID, comment: '记录最后修改者帐号', },
    }, {
        underscored: false,
        createdAt: 'CreatedTime',
        updatedAt: 'UpdatedTime',
        tableName: 'hneb_Role',
        comment: '系统角色表',
    },
    );
};
