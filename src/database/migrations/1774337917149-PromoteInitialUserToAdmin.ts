import { MigrationInterface, QueryRunner } from 'typeorm';

export class PromoteInitialUserToAdmin1774337917149 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminUsername = process.env.ADMIN_USERNAME;

    if (!adminUsername) {
      throw new Error('ADMIN_USERNAME env var not set');
    }

    const result: Array<{ id: number }> = await queryRunner.query(
      `
      SELECT "id"
      FROM "users"
      WHERE "username" = $1
      LIMIT 1
      `,
      [adminUsername],
    );

    if (result.length === 0) {
      throw new Error(
        `User with username "${adminUsername}" was not found in "users" table`,
      );
    }

    await queryRunner.query(
      `
      UPDATE "users"
      SET "role" = 'admin'
      WHERE "username" = $1
      `,
      [adminUsername],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const adminUsername = process.env.ADMIN_USERNAME;

    if (!adminUsername) {
      throw new Error('ADMIN_USERNAME env var not set');
    }

    await queryRunner.query(
      `
      UPDATE "users"
      SET "role" = 'user'
      WHERE "username" = $1 AND "role" = 'admin'
      `,
      [adminUsername],
    );
  }
}
