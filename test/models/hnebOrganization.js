const { Sequelize, DataTypes, UUIDV4 } = require("sequelize");

module.exports = function (sequelize) {
    return sequelize.define('hnebOrganization', {
        OrgId: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, comment: '单位ID' },
        RefId: { type: DataTypes.STRING(64), comment: '机构信息来源于其他系统时的参考ID', },
        OrgCode: { type: DataTypes.STRING(32), allowNull: false, comment: '部门机构代码', },
        OrgTypeCode: { type: DataTypes.STRING(20), defaultValue: 'XFJG', comment: '部门类型代码', },
        AreaCode: { type: DataTypes.STRING(10), comment: '区划代码', },
        Weights: { type: DataTypes.DECIMAL(12, 0), comment: '权重', },
        OrgName: { type: DataTypes.STRING(64), allowNull: false, comment: '部门机构名称', },
        Description: { type: DataTypes.TEXT, comment: '描述(简介)', },
        ParentOrgId: { type: DataTypes.UUID, references: { model: 'hneb_Organization', key: 'OrgId', }, comment: '上级机构ID', },
        OrgTree: { type: DataTypes.STRING(255), allowNull: false, comment: '机构树代码', },
        Jurisdiction: { type: DataTypes.TEXT, comment: '辖区范围', },
        Gis_X: { type: DataTypes.DECIMAL(10, 7), comment: 'Google经度', },
        Gis_Y: { type: DataTypes.DECIMAL(10, 7), comment: 'Google纬度', },
        BaiduLng: { type: DataTypes.DECIMAL(10, 7), comment: 'Baidu经度', },
        BaiduLat: { type: DataTypes.DECIMAL(10, 7), comment: 'Baidu纬度', },
        RecordState: { type: DataTypes.ENUM, values: ['A', 'D', 'R'], allowNull: false, defaultValue: 'A', comment: '记录状态: A-有效, D-禁用, R-逻辑删除', },
        CreatedBy: { type: DataTypes.UUID, comment: '记录创建者帐号', },
        UpdatedBy: { type: DataTypes.UUID, comment: '记录最后修改者帐号', },
    }, {
        underscored: false,
        createdAt: 'CreatedTime',
        updatedAt: 'UpdatedTime',
        tableName: 'hneb_Organization',
        comment: '组织机构表',
        indexes: [
            { name: 'UI_OrgCode', unique: true, fields: ['OrgCode'], },
            { name: 'UI_OrgTree', unique: true, fields: ['OrgTree'], },
        ],
    });
};