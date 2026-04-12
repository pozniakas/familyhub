import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskAssigneeIds1744408800003 implements MigrationInterface {
  name = 'TaskAssigneeIds1744408800003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE tasks ADD COLUMN assignee_ids text`);
    await queryRunner.query(`ALTER TABLE tasks DROP COLUMN assigned_to`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE tasks ADD COLUMN assigned_to text NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE tasks DROP COLUMN assignee_ids`);
  }
}
