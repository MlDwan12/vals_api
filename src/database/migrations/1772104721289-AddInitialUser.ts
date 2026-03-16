import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config as loadEnv } from 'dotenv';

loadEnv();

export class AddInitialUser1772104721289 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      throw new Error('ADMIN_USERNAME or ADMIN_PASSWORD env vars not set');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await queryRunner.query(
      `
      INSERT INTO "users" ("username", "password")
      VALUES ($1, $2)
      ON CONFLICT ("username") DO NOTHING
      `,
      [username, hashedPassword],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const username = process.env.ADMIN_USERNAME;

    if (!username) {
      throw new Error('ADMIN_USERNAME env var not set');
    }

    await queryRunner.query(`DELETE FROM "users" WHERE "username" = $1`, [
      username,
    ]);
  }
}
