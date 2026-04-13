import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskNotifications1744408800005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS early_reminder_value  INTEGER`);
    await queryRunner.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS early_reminder_unit   VARCHAR`);
    await queryRunner.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS early_reminder_sent_at TIMESTAMPTZ`);
    await queryRunner.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_sent_at       TIMESTAMPTZ`);
    await queryRunner.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS overdue_count          INTEGER NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE tasks DROP COLUMN IF EXISTS overdue_count`);
    await queryRunner.query(`ALTER TABLE tasks DROP COLUMN IF EXISTS reminder_sent_at`);
    await queryRunner.query(`ALTER TABLE tasks DROP COLUMN IF EXISTS early_reminder_sent_at`);
    await queryRunner.query(`ALTER TABLE tasks DROP COLUMN IF EXISTS early_reminder_unit`);
    await queryRunner.query(`ALTER TABLE tasks DROP COLUMN IF EXISTS early_reminder_value`);
  }
}
