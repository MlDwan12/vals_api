import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserRoles1782650000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminUsername = process.env.ADMIN_USERNAME;

    if (!adminUsername) {
      throw new Error('ADMIN_USERNAME env var not set');
    }

    // Главный пользователь (разработчик) получает роль developer
    await queryRunner.query(
      `UPDATE "users" SET "role" = 'developer' WHERE "username" = $1 AND "role" = 'admin'`,
      [adminUsername],
    );

    // Все модераторы становятся контент-менеджерами
    await queryRunner.query(
      `UPDATE "users" SET "role" = 'content_manager' WHERE "role" = 'moderator'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const adminUsername = process.env.ADMIN_USERNAME;

    if (!adminUsername) {
      throw new Error('ADMIN_USERNAME env var not set');
    }

    await queryRunner.query(
      `UPDATE "users" SET "role" = 'admin' WHERE "username" = $1 AND "role" = 'developer'`,
      [adminUsername],
    );

    await queryRunner.query(
      `UPDATE "users" SET "role" = 'moderator' WHERE "role" = 'content_manager'`,
    );
  }
}
