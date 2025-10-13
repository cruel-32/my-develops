import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

import { db } from './connection';
import { roles, users, operatorRoles } from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // 1. 기본 역할(roles) 생성
    console.log('\n📋 Creating default roles...');
    const defaultRoles = [
      {
        roleName: 'super_admin',
        roleDesc:
          '모든 프로젝트의 생성과 삭제 권한을 가지고 있으며, 모든 사용자 권한 생성, 사용자 권한 삭제, 사용자 삭제 가능 (super_admin 권한을 생성/삭제는 불가, super_admin 사용자를 삭제하는 것도 불가)',
        enabled: true,
      },
      {
        roleName: 'admin',
        roleDesc:
          '모든 프로젝트의 생성과 삭제 권한을 가지고 있으며, 모든 사용자 권한 생성, 사용자 권한 삭제, 사용자 삭제 가능 (super_admin 권한을 생성/삭제는 불가, super_admin 사용자를 삭제하는 것도 불가)',
        enabled: true,
      },
    ] as const;

    const createdRoles: Record<string, number> = {};

    for (const role of defaultRoles) {
      const existing = await db
        .select()
        .from(roles)
        .where(eq(roles.roleName, role.roleName))
        .limit(1);

      if (existing.length === 0) {
        const result = await db.insert(roles).values(role).returning();
        if (result[0]) {
          createdRoles[role.roleName] = result[0].id;
          console.log(
            `  ✅ Created role: ${role.roleName} (ID: ${result[0].id})`
          );
        }
      } else {
        if (!existing[0]) {
          throw new Error(
            `Unexpected error: Role ${role.roleName} not found in query result`
          );
        }
        createdRoles[role.roleName] = existing[0].id;
        console.log(
          `  ⏭️  Role already exists: ${role.roleName} (ID: ${existing[0].id})`
        );
      }
    }

    // 2. Super Admin 계정 생성
    console.log('\n👤 Creating super admin user...');
    const superAdminEmail = 'super_admin@mydevelops.com';
    const superAdminPassword = 'admin1234!';

    const existingSuperAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, superAdminEmail))
      .limit(1);

    let superAdminUserId: number;

    if (existingSuperAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
      const result = await db
        .insert(users)
        .values({
          email: superAdminEmail,
          name: 'Super Admin',
          password_hash: hashedPassword,
          is_verified: true,
        })
        .returning();

      if (!result[0]) {
        throw new Error('Failed to create super admin user');
      }

      superAdminUserId = result[0].id;
      console.log(`  ✅ Created super admin user (ID: ${superAdminUserId})`);
    } else {
      if (!existingSuperAdmin[0]) {
        throw new Error(
          'Unexpected error: Super admin user not found in query result'
        );
      }
      superAdminUserId = existingSuperAdmin[0].id;
      console.log(
        `  ⏭️  Super admin user already exists (ID: ${superAdminUserId})`
      );
    }

    // 3. Super Admin 역할 연결 (operator_roles)
    console.log('\n🔗 Connecting super admin role to user...');
    const superAdminRoleId = createdRoles['super_admin'];

    if (!superAdminRoleId) {
      throw new Error('Super admin role not found!');
    }

    const existingOperatorRole = await db
      .select()
      .from(operatorRoles)
      .where(eq(operatorRoles.userId, superAdminUserId))
      .limit(1);

    if (existingOperatorRole.length === 0) {
      await db.insert(operatorRoles).values({
        userId: superAdminUserId,
        roleId: superAdminRoleId,
      });
      console.log(
        `  ✅ Connected super_admin role to user (User ID: ${superAdminUserId}, Role ID: ${superAdminRoleId})`
      );
    } else {
      console.log(`  ⏭️  User already has a role assigned`);
    }

    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📝 Super Admin Credentials:');
    console.log(`   Email: ${superAdminEmail}`);
    console.log(`   Password: ${superAdminPassword}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
