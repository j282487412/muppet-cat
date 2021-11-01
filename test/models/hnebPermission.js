const { Sequelize, DataTypes, UUIDV4 } = require("sequelize");

module.exports = function (sequelize) {
  return sequelize.define('hnebPermission', {
    PermissionId: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, },
    ObjectId: { type: DataTypes.UUID, allowNull: false, },

    ObjectType: { type: DataTypes.ENUM, values: ['O', 'R', 'U'], allowNull: false, defaultValue: 'R', comment: '所属类型: O-单位, R-角色, U-用户', },

    OperationId: { type: DataTypes.UUID, allowNull: false, references: { model: sequelize.models.hnebOperation, key: 'OperationId' }, },

    RecordState: { type: DataTypes.ENUM, values: ['A', 'D', 'R'], allowNull: false, defaultValue: 'A', comment: '记录状态: A-有效, D-禁用, R-逻辑删除', },
    CreatedBy: { type: DataTypes.STRING(20), allowNull: false, comment: '记录创建者帐号' },
    UpdatedBy: { type: DataTypes.STRING(20), comment: '记录最后修改者帐号' },
  }, {
    underscored: false,
    createdAt: 'CreatedTime',
    updatedAt: 'UpdatedTime',
    tableName: 'hneb_Permission',
    comment: '角色权限表',
    indexes: [
      { name: 'UI_ObjectId_ObjectType_Operation', unique: true, fields: ['ObjectId', 'ObjectType', 'OperationId'] }
    ],
  });
};
