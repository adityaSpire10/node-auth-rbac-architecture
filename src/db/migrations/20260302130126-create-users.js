"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("users", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            first_name: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: { notEmpty: true, len: [1, 100] },
            },
            last_name: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: { notEmpty: true, len: [1, 100] },
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                validate: { isEmail: true },
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            avatar_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            is_verified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            last_login_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            created_by: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            updated_by: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            deleted_at: {
                allowNull: true,
                type: Sequelize.DATE,
            },
        })
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("users");
    },
}