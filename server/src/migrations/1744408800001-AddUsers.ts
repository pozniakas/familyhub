import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddUsers1744408800001 implements MigrationInterface {
  name = 'AddUsers1744408800001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'username', type: 'varchar', isUnique: true, isNullable: false },
          { name: 'password_hash', type: 'text', isNullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users', true);
  }
}
