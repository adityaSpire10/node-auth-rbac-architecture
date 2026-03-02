"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create UserRole junction table
    await queryInterface.createTable("user_roles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("user_roles", ["user_id"]);
    await queryInterface.addIndex("user_roles", ["role_id"]);
    await queryInterface.addIndex("user_roles", ["user_id", "role_id"], {
      unique: true,
      name: "unique_user_role",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("user_roles");
  },
};
