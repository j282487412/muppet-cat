const { Sequelize, DataTypes, UUIDV4 } = require("sequelize");
module.exports = function (sequelize) {
    return sequelize.define('hnebUser', {
        UserId: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, comment: '用户ID', },
        RefId: { type: DataTypes.STRING(64), comment: '用户信息来源于其他系统时的参考ID', },

        RoleId: { type: DataTypes.UUID, allowNull: false, references: { model: 'hneb_Role', key: 'RoleId', }, },
        OrgId: { type: DataTypes.UUID, allowNull: false, references: { model: 'hneb_Organization', key: 'OrgId', }, },
        DataOrgId: { type: DataTypes.UUID, allowNull: false, references: { model: 'hneb_Organization', key: 'OrgId', }, },

        DisplayName: { type: DataTypes.STRING(20), allowNull: false, comment: '用户姓名', },
        Gender: { type: DataTypes.ENUM, values: ['男', '女', '不详'], allowNull: false, defaultValue: '不详', comment: '性别：男、女、不详', },
        BirthDate: { type: DataTypes.DATE, },
        TitleCode: { type: DataTypes.STRING(32), comment: '职位代码', },
        PhoneNumber: { type: DataTypes.STRING(16), },
        Icon: { type: DataTypes.STRING(255), comment: '用户头像', },
        DispatchedState: { type: DataTypes.STRING(8), defaultValue: '待命', comment: '调派状态', },

        AccountType: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'U', comment: '用户类型', },

        // GroupId: { type: DataTypes.UUID, references: { model: sequelize.models.hnebChatGroup, key: 'ChatGroupId', }, },
        // GroupName: { type: DataTypes.STRING(255), comment: '默认组名', },
        RecordState: { type: DataTypes.ENUM, values: ['A', 'D', 'R'], allowNull: false, defaultValue: 'A', comment: '记录状态: A-有效, D-禁用, R-逻辑删除', },
        CreatedBy: { type: DataTypes.UUID, references: { model: 'hneb_User', key: 'UserId', }, comment: '记录创建者帐号', },
        UpdatedBy: { type: DataTypes.UUID, references: { model: 'hneb_User', key: 'UserId', }, comment: '记录最后修改者帐号', },
    }, {
        underscored: false,
        createdAt: 'CreatedTime',
        updatedAt: 'UpdatedTime',
        tableName: 'hneb_User',
        comment: '系统用户表',
        indexes: [],
    },
    );
};
