"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Roles extends Model {
    static associate(models) {
      this.belongsToMany(models.Users, {
        through: 'user_roles',
        foreignKey: 'role_id',
        otherKey: 'user_id',
        as: 'Users',
      });
    }
  }
  Roles.init(
    {
      role_name: DataTypes.STRING,
      access_ids: DataTypes.STRING,
      note: DataTypes.STRING,
      created_by: DataTypes.STRING,
      updated_by: DataTypes.STRING,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Roles",
      tableName: "roles",
      paranoid: true,
      timestamps: true,
      underscored: true,
    }
  );
  return Roles;
};
