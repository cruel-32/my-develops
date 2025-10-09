# Database Layer (Infrastructure)

이 디렉토리는 데이터베이스와의 상호작용을 위한 모든 구체적인 구현을 포함합니다. Drizzle ORM 스키마, 마이그레이션 파일, 데이터베이스 연결 설정 등이 여기에 위치합니다.

---

# Database Schema Guide

## Overview

PostgreSQL 16 + Drizzle ORM을 사용한 데이터베이스 스키마 관리

---

## Schema Structure

```
db/
├── connection.ts       # Database connection
├── migrate.ts         # Migration runner
└── schema/
    ├── index.ts       # Schema exports (IMPORTANT: enums first!)
    ├── enums.ts       # PostgreSQL enums
    ├── users.schema.ts
    ├── roles.schema.ts
    ├── operator-roles.schema.ts
    ├── projects.schema.ts
    ├── prj-roles.schema.ts
    ├── canvases.schema.ts
    ├── erd-canvases.schema.ts
    ├── diagram-posts.schema.ts
    ├── erd-nodes.schema.ts
    └── node-fields.schema.ts
```

---

## Important Rules

### 1. Export Order (CRITICAL!)

```typescript
// schema/index.ts
export * from './enums'; // ⚠️ FIRST: Export enums before tables!
export * from './users.schema';
export * from './roles.schema';
// ... other tables
```

**Why?**: PostgreSQL enums must be created before tables that use them.

### 2. Naming Conventions

```typescript
// TypeScript (camelCase)
userId: bigint('user_id', { mode: 'number' })

// Database (snake_case)
user_id BIGINT
```

### 3. Foreign Key Patterns

```typescript
// Standard FK with CASCADE
userId: bigint('user_id', { mode: 'number' }).references(() => users.id, {
  onDelete: 'cascade',
});

// Composite PK with FKs
export const operatorRoles = pgTable(
  'operator_roles',
  {
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, {
      onDelete: 'cascade',
    }),
    roleId: bigint('role_id', { mode: 'number' }).references(() => roles.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
  })
);
```

---

## CASCADE Rules

### User Deletion

```
users 삭제 → projects 삭제 → canvases/erd_canvases 삭제
→ diagram_posts/erd_nodes 삭제 → node_fields 삭제
```

### Project Deletion

```
projects 삭제 → canvases/erd_canvases 삭제
→ diagram_posts/erd_nodes 삭제 → node_fields 삭제
```

### Canvas Deletion

```
canvases 삭제 → diagram_posts 삭제
erd_canvases 삭제 → erd_nodes 삭제 → node_fields 삭제
```

---

## Database Commands

### Development

```bash
# Generate migration files
pnpm db:generate

# Push schema changes (dev only)
pnpm db:push

# Open Drizzle Studio
pnpm --filter mydevelops-be db:studio
```

### Production

```bash
# Run migrations
pnpm db:migrate
```

---

## Schema Tables

### Core Tables

#### users

```typescript
{
  id: bigserial (PK)
  email: varchar(50)
  name: varchar(50)
  picture: varchar(50)
  createdAt: timestamp (default: now())
  updatedAt: timestamp (default: now())
}
```

#### roles

```typescript
{
  id: bigserial (PK)
  roleName: varchar(50)
  roleDesc: varchar(255)
  enabled: boolean (default: true)
}
```

#### projects

```typescript
{
  id: bigserial (PK)
  name: varchar(50)
  description: varchar(255)
  public: boolean (default: false)
  ownerId: bigint (FK → users.id, CASCADE)
}
```

### Many-to-Many Tables

#### operator_roles

```typescript
{
  userId: bigint (FK → users.id, CASCADE) (PK)
  roleId: bigint (FK → roles.id, CASCADE) (PK)
}
```

#### prj_roles

```typescript
{
  projectId: bigint (FK → projects.id, CASCADE) (PK)
  roleId: bigint (FK → roles.id, CASCADE) (PK)
}
```

### Diagram Tables

#### canvases

```typescript
{
  id: bigserial (PK)
  prjId: bigint (FK → projects.id, CASCADE)
}
```

#### erd_canvases

```typescript
{
  id: bigserial (PK)
  prjId: bigint (FK → projects.id, CASCADE)
}
```

#### diagram_posts

```typescript
{
  id: bigserial (PK)
  type: diagram_type (enum)
  userId: bigint (FK → users.id, CASCADE)
  canvasId: bigint (FK → canvases.id, CASCADE)
}
```

#### erd_nodes

```typescript
{
  id: uuid (PK)
  canvasId: bigint (FK → erd_canvases.id, CASCADE)
  logicalName: varchar(50)
  physicalName: varchar(50)
  label: varchar(30)
  position: jsonb
  type: node_type (enum)
}
```

#### node_fields

```typescript
{
  id: uuid (PK)
  nodeId: uuid (FK → erd_nodes.id, CASCADE)
  canvasId: bigint (FK → erd_canvases.id, CASCADE)
  index: integer
  logicalName: varchar(50)
  physicalName: varchar(50)
}
```

---

## Enums

```typescript
// enums.ts
export const nodeTypeEnum = pgEnum('node_type', ['databaseSchema']);
export const diagramTypeEnum = pgEnum('diagram_type', [
  'activity',
  'sequence',
  'class',
  'state',
]);
```

---

## Adding New Schema

### Step 1: Create Schema File

```typescript
// schema/new-table.schema.ts
import { pgTable, bigserial, varchar } from 'drizzle-orm/pg-core';

export const newTable = pgTable('new_table', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 50 }),
});
```

### Step 2: Export in index.ts

```typescript
// schema/index.ts
export * from './enums'; // Keep enums first!
export * from './users.schema';
export * from './new-table.schema'; // Add here
// ...
```

### Step 3: Generate Migration

```bash
pnpm db:generate
```

### Step 4: Apply Changes

```bash
# Development
pnpm db:push

# Production
pnpm db:migrate
```

---

## Entity Relationships

```
users (1) ──< (N) operator_roles (N) >── (1) roles
  │
  │ (CASCADE)
  └─> (1) ──< (N) projects (N) >── (1) roles (prj_roles)
          │
          │ (CASCADE)
          ├─> (1) ──< (N) canvases
          │           │
          │           │ (CASCADE)
          │           └─> (1) ──< (N) diagram_posts
          │
          └─> (1) ──< (N) erd_canvases
                      │
                      │ (CASCADE)
                      ├─> (1) ──< (N) erd_nodes
                      │           │
                      │           │ (CASCADE)
                      │           └─> (1) ──< (N) node_fields
                      │
                      └─> (1) ──< (N) node_fields
```

---

## Common Patterns

### UUID vs BigSerial

```typescript
// Use bigserial for main entities
id: bigserial('id', { mode: 'number' }).primaryKey();

// Use uuid for nested/diagram entities
id: uuid('id').defaultRandom().primaryKey();
```

### Timestamps

```typescript
createdAt: timestamp('create_at').defaultNow();
updatedAt: timestamp('update_at').defaultNow();
```

### Boolean Flags

```typescript
public: boolean('public').default(false);
enabled: boolean('enabled').default(true);
```

### JSONB for Complex Data

```typescript
position: jsonb('position'); // { x: number, y: number }
```

---

## Connection

```typescript
// db/connection.ts
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const sql = postgres(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

**Usage**:

```typescript
import { db } from '@/db/connection';
import { users } from '@/db/schema';

const allUsers = await db.select().from(users);
```

---

## Troubleshooting

### "Type does not exist" Error

- ✅ Check `schema/index.ts` exports enums first
- ✅ Restart dev server after schema changes

### Migration Issues

```bash
# Reset database (WARNING: deletes all data)
make db-reset

# Or manually
docker exec -it my-develops-postgres-1 psql -U mydevelops -d mydevelops -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
pnpm db:push
```

### FK Constraint Errors

- Check CASCADE settings
- Verify referenced table exists
- Ensure correct column types

---

_For DDD integration, see `modules/_/infrastructure/repositories/`\*
