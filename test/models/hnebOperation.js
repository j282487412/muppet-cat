const { Sequelize, DataTypes, UUIDV4 } = require("sequelize");

module.exports = function (sequelize) {
  return sequelize.define('hnebOperation', {
    OperationId: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, comment: '功能ID' },

    OperationName: { type: DataTypes.STRING(64), comment: '功能名称' },
    OperationUri: { type: DataTypes.STRING(255), allowNull: false, comment: '功能URI', },
    OperationType: { type: DataTypes.ENUM, values: ['M', 'B', 'A'], allowNull: false, comment: '功能类型: M-菜单, B-按钮, A-API', },

    ParentOperationId: { type: DataTypes.UUID, allowNull: false, references: { model: 'hneb_Operation', key: 'OperationId', }, comment: '上级功能ID' },

    SysLogRequired: { type: DataTypes.ENUM, values: ['Y', 'N'], allowNull: false, defaultValue: 'N', comment: '是否需要记录日志: Y-Yes, N-No', },
    RecordState: { type: DataTypes.ENUM, values: ['A', 'D', 'R'], allowNull: false, defaultValue: 'A', comment: '记录状态: A-有效, D-禁用, R-逻辑删除', },
    CreatedBy: { type: DataTypes.STRING(20), allowNull: false, comment: '记录创建者帐号' },
    UpdatedBy: { type: DataTypes.STRING(20), comment: '记录最后修改者帐号' },
  }, {
    underscored: false,
    createdAt: 'CreatedTime',
    updatedAt: 'UpdatedTime',
    tableName: 'hneb_Operation',
    comment: '系统功能表',
    indexes: [{ name: 'UI_OperationUri_OperationType', unique: true, fields: ['OperationUri', 'OperationType'] }],
  },
  );
};
