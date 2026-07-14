import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReadingTimeToArticles1783200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "readingTime" INTEGER NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP COLUMN IF EXISTS "readingTime"`,
    );
  }
}
