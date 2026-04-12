import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialSchema1744408800000 implements MigrationInterface {
  name = 'InitialSchema1744408800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'entities',
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'name', type: 'text', isNullable: false },
          { name: 'emoji', type: 'varchar', default: "'📁'" },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'sections',
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'entity_id', type: 'varchar', isNullable: false },
          { name: 'name', type: 'text', isNullable: false },
          { name: 'sort_order', type: 'int', default: '0' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'sections',
      new TableForeignKey({
        columnNames: ['entity_id'],
        referencedTableName: 'entities',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'items',
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'entity_id', type: 'varchar', isNullable: false },
          { name: 'section_id', type: 'varchar', isNullable: false },
          { name: 'name', type: 'text', isNullable: false },
          { name: 'status', type: 'varchar', default: "'ok'" },
          { name: 'notes', type: 'text', default: "''" },
          { name: 'sort_order', type: 'int', default: '0' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'name', type: 'text', isNullable: false },
          { name: 'entity_id', type: 'varchar', isNullable: true },
          { name: 'priority', type: 'varchar', isNullable: true },
          { name: 'done', type: 'boolean', default: 'false' },
          { name: 'assigned_to', type: 'text', default: "''" },
          { name: 'due_date', type: 'varchar', isNullable: true },
          { name: 'repeat', type: 'varchar', isNullable: true },
          { name: 'repeat_every', type: 'int', isNullable: true },
          { name: 'repeat_frequency', type: 'varchar', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tasks', true);
    await queryRunner.dropTable('items', true);
    await queryRunner.dropTable('sections', true);
    await queryRunner.dropTable('entities', true);
  }
}
