import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDatePublishedAndPriority1782432000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "date_published" TIMESTAMPTZ NULL`);
    await queryRunner.query(`UPDATE "articles" SET "date_published" = "createdAt" WHERE "date_published" IS NULL`);
    await queryRunner.query(`ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "priority" INTEGER NOT NULL DEFAULT 0`);

    await queryRunner.query(`ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "date_published" TIMESTAMPTZ NULL`);
    await queryRunner.query(`UPDATE "cases" SET "date_published" = "created_at" WHERE "date_published" IS NULL`);
    await queryRunner.query(`ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "priority" INTEGER NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN IF EXISTS "date_published"`);
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN IF EXISTS "priority"`);
    await queryRunner.query(`ALTER TABLE "cases" DROP COLUMN IF EXISTS "date_published"`);
    await queryRunner.query(`ALTER TABLE "cases" DROP COLUMN IF EXISTS "priority"`);
  }
}
