import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddPushSubscriptions1744408800002 implements MigrationInterface {
  name = 'AddPushSubscriptions1744408800002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'push_subscriptions',
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'user_id', type: 'varchar', isNullable: false },
          { name: 'endpoint', type: 'text', isNullable: false },
          { name: 'keys', type: 'text', isNullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('push_subscriptions', true);
  }
}
