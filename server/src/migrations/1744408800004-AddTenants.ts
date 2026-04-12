import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_TENANT_ID = 'tenant-default';

export class AddTenants1744408800004 implements MigrationInterface {
  name = 'AddTenants1744408800004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create tenants table
    await queryRunner.query(`
      CREATE TABLE tenants (
        id varchar PRIMARY KEY,
        name text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // 2. Insert a default tenant for all existing data
    await queryRunner.query(
      `INSERT INTO tenants (id, name) VALUES ($1, $2)`,
      [DEFAULT_TENANT_ID, 'Default Family'],
    );

    // 3. Add tenant_id to users
    await queryRunner.query(`ALTER TABLE users ADD COLUMN tenant_id varchar`);
    await queryRunner.query(`UPDATE users SET tenant_id = $1`, [DEFAULT_TENANT_ID]);
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL`);

    // 4. Add tenant_id to entities
    await queryRunner.query(`ALTER TABLE entities ADD COLUMN tenant_id varchar`);
    await queryRunner.query(`UPDATE entities SET tenant_id = $1`, [DEFAULT_TENANT_ID]);
    await queryRunner.query(`ALTER TABLE entities ALTER COLUMN tenant_id SET NOT NULL`);

    // 5. Add tenant_id to tasks
    await queryRunner.query(`ALTER TABLE tasks ADD COLUMN tenant_id varchar`);
    await queryRunner.query(`UPDATE tasks SET tenant_id = $1`, [DEFAULT_TENANT_ID]);
    await queryRunner.query(`ALTER TABLE tasks ALTER COLUMN tenant_id SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE tasks DROP COLUMN tenant_id`);
    await queryRunner.query(`ALTER TABLE entities DROP COLUMN tenant_id`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN tenant_id`);
    await queryRunner.query(`DROP TABLE tenants`);
  }
}
