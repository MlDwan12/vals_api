import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateArticleCaseFaqTables1783100000000
  implements MigrationInterface
{
  name = 'CreateArticleCaseFaqTables1783100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ===== article_faq =====
    await queryRunner.createTable(
      new Table({
        name: 'article_faq',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'article_id', type: 'int', isNullable: false },
          { name: 'question', type: 'text', isNullable: false },
          { name: 'answer', type: 'text', isNullable: false },
          { name: 'order_index', type: 'int', isNullable: false, default: 0 },
          {
            name: 'date_create',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'date_update',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'article_faq',
      new TableForeignKey({
        name: 'FK_ARTICLE_FAQ_ARTICLE',
        columnNames: ['article_id'],
        referencedTableName: 'articles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // удалили статью — вопросы удаляются вместе с ней
      }),
    );
    await queryRunner.createIndex(
      'article_faq',
      new TableIndex({
        name: 'IDX_ARTICLE_FAQ_ARTICLE',
        columnNames: ['article_id'],
      }),
    );

    // ===== case_faq =====
    await queryRunner.createTable(
      new Table({
        name: 'case_faq',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'case_id', type: 'int', isNullable: false },
          { name: 'question', type: 'text', isNullable: false },
          { name: 'answer', type: 'text', isNullable: false },
          { name: 'order_index', type: 'int', isNullable: false, default: 0 },
          {
            name: 'date_create',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'date_update',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'case_faq',
      new TableForeignKey({
        name: 'FK_CASE_FAQ_CASE',
        columnNames: ['case_id'],
        referencedTableName: 'cases',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // удалили кейс — вопросы удаляются вместе с ним
      }),
    );
    await queryRunner.createIndex(
      'case_faq',
      new TableIndex({ name: 'IDX_CASE_FAQ_CASE', columnNames: ['case_id'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('case_faq', true);
    await queryRunner.dropTable('article_faq', true);
  }
}
