import { db } from './connection';
import { roles, users, operatorRoles } from './schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

/**
 * 애플리케이션 시작 시 데이터베이스 초기화를 수행합니다.
 * - 기본 역할(roles)이 없으면 생성
 * - Super Admin 계정이 없으면 생성
 * - Super Admin 역할 연결
 */
export async function initializeDatabase() {
  try {
    console.log('🔍 Checking database initialization...');

    // 1. 역할 테이블 체크
    const existingRoles = await db.select().from(roles);

    if (existingRoles.length === 0) {
      console.log('🌱 Initializing default roles...');

      const defaultRoles = [
        {
          roleName: 'super_admin',
          roleDesc:
            '프로젝트 생성, 프로젝트 삭제, 사용자 권한 생성, 사용자 권한 삭제, 사용자 삭제, 역할주기 (super_admin은 불가)',
          enabled: true,
        },
        {
          roleName: 'admin',
          roleDesc:
            '사용자 권한 생성, 사용자 권한 삭제, 사용자 삭제 (super_admin, admin 제외), 역할주기 (super_admin은 불가)',
          enabled: true,
        },
        {
          roleName: 'user',
          roleDesc: 'User',
          enabled: true,
        },
      ];

      const createdRoles = await db
        .insert(roles)
        .values(defaultRoles)
        .returning();
      console.log(`✅ Created ${createdRoles.length} default roles`);

      // 2. Super Admin 계정 생성
      console.log('👤 Creating super admin user...');
      const superAdminEmail = 'super_admin@mydevelops.com';
      const superAdminPassword = 'admin1234!';
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

      const [superAdmin] = await db
        .insert(users)
        .values({
          email: superAdminEmail,
          name: 'Super Admin',
          password_hash: hashedPassword,
          is_verified: true,
        })
        .returning();

      if (!superAdmin) {
        throw new Error('Failed to create super admin user');
      }

      console.log(`✅ Created super admin user (ID: ${superAdmin.id})`);

      // 3. Super Admin 역할 연결
      const superAdminRole = createdRoles.find(
        (r) => r.roleName === 'super_admin'
      );

      if (superAdminRole) {
        await db.insert(operatorRoles).values({
          userId: superAdmin.id,
          roleId: superAdminRole.id,
        });
        console.log(`✅ Connected super_admin role to user`);
      }

      console.log('✨ Database initialized successfully!');
    } else {
      console.log('✅ Database already initialized');

      // Super Admin 계정 존재 여부만 체크
      const superAdminEmail = 'super_admin@mydevelops.com';
      const existingSuperAdmin = await db
        .select()
        .from(users)
        .where(eq(users.email, superAdminEmail))
        .limit(1);

      if (existingSuperAdmin.length === 0) {
        console.log(
          '⚠️  Warning: Super admin user not found. Run "pnpm db:seed" to create it.'
        );
      }
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
