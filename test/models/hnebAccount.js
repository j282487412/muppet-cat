const { Sequelize, DataTypes, UUIDV4 } = require("sequelize");

module.exports = function (sequelize) {
    return sequelize.define('hnebAccount', {
        AccountId: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, comment: '帐号ID', },
        OpenId: { type: DataTypes.STRING(40), comment: 'OpenId', },
        UserName: { type: DataTypes.STRING(20), comment: '用户帐号', },
        Password: { type: DataTypes.STRING(64), comment: '密码(密文)', },
        LoginMode: { type: DataTypes.STRING(10), defaultValue: 'Q', comment: '登录方式 Q-专用机，R-RFID, Z-直播盒，G-GPS设备，4-4G布控球，V-车辆，H-电脑，P-普通手机，W-微信，D-钉钉，O-其他', },
        
        UserId: { type: DataTypes.UUID, references: { model: 'hneb_User', key: 'UserId', }, comment: '所属用户', },

        RecordState: { type: DataTypes.ENUM, values: ['A', 'D', 'R'], allowNull: false, defaultValue: 'A', comment: '记录状态: A-有效, D-禁用, R-逻辑删除', },
        CreatedBy: { type: DataTypes.UUID, references: { model: 'hneb_User', key: 'UserId', }, comment: '记录创建者帐号', },
        UpdatedBy: { type: DataTypes.UUID, references: { model: 'hneb_User', key: 'UserId', }, comment: '记录最后修改者帐号', },
    }, {
        underscored: false,
        createdAt: 'CreatedTime',
        updatedAt: 'UpdatedTime',
        tableName: 'hneb_Account',
        comment: '系统账户表',
        indexes: [
            { name: 'UI_UserName_Password', unique: true, fields: ['UserName', 'Password'], },
            { name: 'UI_OpenId', unique: true, fields: ['OpenId'], },
        ],
    },
    );
};
