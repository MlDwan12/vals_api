import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHasTocToCases1783700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "hasToc" BOOLEAN NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cases" DROP COLUMN IF EXISTS "hasToc"`,
    );
  }
}
