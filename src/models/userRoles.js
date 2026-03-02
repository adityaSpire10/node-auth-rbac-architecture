const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserRoles extends Model {}

    UserRoles.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
        },
        {
            sequelize,
            modelName: 'UserRoles',
            tableName: 'user_roles',
            timestamps: false,
            underscored: true,
        }
    );

    return UserRoles;
};
