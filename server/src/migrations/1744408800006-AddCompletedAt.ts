import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompletedAt1744408800006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tasks DROP COLUMN IF EXISTS completed_at`,
    );
  }
}
