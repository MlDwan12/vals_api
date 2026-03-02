import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

export class AddInitialUser1772104721289 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      throw new Error('ADMIN_EMAIL or ADMIN_PASSWORD env vars not set');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await queryRunner.query(
      `INSERT INTO "users" ("username", "password") 
       VALUES ('${username}', '${hashedPassword}')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const username = process.env.ADMIN_USERNAME;

    await queryRunner.query(`DELETE FROM "users" WHERE username = '${username}'`);
  }
}
