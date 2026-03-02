'use strict';

const crypto = require('crypto');

// Helper function to generate UUID v4
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            const ROLES = [
                { role_name: 'admin', status: 'Active', note: 'Full system access', created_at: new Date(), updated_at: new Date() },
                { role_name: 'moderator', status: 'Active', note: 'Content moderation access', created_at: new Date(), updated_at: new Date() },
                { role_name: 'user', status: 'Active', note: 'Standard user access', created_at: new Date(), updated_at: new Date() },
            ];

            // Insert roles
            await queryInterface.bulkInsert('roles', ROLES, {
                ignoreDuplicates: true,
            });

            // Get admin role
            const adminRole = await queryInterface.sequelize.query(
                'SELECT id FROM roles WHERE role_name = ?',
                { replacements: ['admin'], type: Sequelize.QueryTypes.SELECT }
            );

            if (adminRole.length === 0) {
                throw new Error('Admin role not found');
            }

            const adminRoleId = adminRole[0].id;

            // Create admin user (use bcrypt to hash password)
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('Admin@123456', 12);

            const adminUserId = generateUUID();
            await queryInterface.bulkInsert('users', [
                {
                    id: adminUserId,
                    first_name: 'Super',
                    last_name: 'Admin',
                    email: 'admin@example.com',
                    password: hashedPassword,
                    is_active: true,
                    is_verified: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ], {
                ignoreDuplicates: true,
            });

            // Assign admin role to user
            await queryInterface.bulkInsert('user_roles', [
                {
                    id: generateUUID(),
                    user_id: adminUserId,
                    role_id: adminRoleId,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ], {
                ignoreDuplicates: true,
            });

            console.log('✓ Roles seeded successfully');
            console.log('✓ Admin user created: admin@example.com / Admin@123456');
        } catch (error) {
            console.error('Seeding error:', error);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        try {
            // Delete admin user and associated role assignment
            await queryInterface.bulkDelete('user_roles', { where: {} }, {});
            await queryInterface.bulkDelete('users', { where: { email: 'admin@example.com' } });
            await queryInterface.bulkDelete('roles', { where: {} });
        } catch (error) {
            console.error('Undo seeding error:', error);
            throw error;
        }
    },
};
