import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateTagsTable1783000000000 implements MigrationInterface {
  name = 'CreateTagsTable1783000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tags',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'slug', type: 'varchar', length: '255', isNullable: false },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'tags',
      new TableIndex({ name: 'IDX_TAGS_SLUG_UNIQUE', columnNames: ['slug'], isUnique: true }),
    );

    // ===== article_tags (many-to-many) =====
    await queryRunner.createTable(
      new Table({
        name: 'article_tags',
        columns: [
          { name: 'article_id', type: 'int', isPrimary: true },
          { name: 'tag_id', type: 'int', isPrimary: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'article_tags',
      new TableForeignKey({
        name: 'FK_ARTICLE_TAGS_ARTICLE',
        columnNames: ['article_id'],
        referencedTableName: 'articles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // удалили статью — связь просто исчезает
      }),
    );
    await queryRunner.createForeignKey(
      'article_tags',
      new TableForeignKey({
        name: 'FK_ARTICLE_TAGS_TAG',
        columnNames: ['tag_id'],
        referencedTableName: 'tags',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // удалили тег — связь просто исчезает, статья жива (не RESTRICT, как у employee_id)
      }),
    );
    await queryRunner.createIndex(
      'article_tags',
      new TableIndex({ name: 'IDX_ARTICLE_TAGS_TAG', columnNames: ['tag_id'] }),
    );

    // ===== case_tags (many-to-many) =====
    await queryRunner.createTable(
      new Table({
        name: 'case_tags',
        columns: [
          { name: 'case_id', type: 'int', isPrimary: true },
          { name: 'tag_id', type: 'int', isPrimary: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'case_tags',
      new TableForeignKey({
        name: 'FK_CASE_TAGS_CASE',
        columnNames: ['case_id'],
        referencedTableName: 'cases',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // удалили кейс — связь просто исчезает
      }),
    );
    await queryRunner.createForeignKey(
      'case_tags',
      new TableForeignKey({
        name: 'FK_CASE_TAGS_TAG',
        columnNames: ['tag_id'],
        referencedTableName: 'tags',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // удалили тег — связь просто исчезает, кейс жив
      }),
    );
    await queryRunner.createIndex(
      'case_tags',
      new TableIndex({ name: 'IDX_CASE_TAGS_TAG', columnNames: ['tag_id'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('case_tags', true);
    await queryRunner.dropTable('article_tags', true);
    await queryRunner.dropTable('tags', true);
  }
}
