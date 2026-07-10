import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateEmployeesTable1782750000000 implements MigrationInterface {
  name = 'CreateEmployeesTable1782750000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'employees',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'slug', type: 'varchar', length: '255', isNullable: false },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'position', type: 'varchar', length: '255', isNullable: false },
          { name: 'photoUrl', type: 'varchar', length: '2048', isNullable: true },
          { name: 'shortBio', type: 'text', isNullable: true },
          { name: 'bio', type: 'jsonb', isNullable: true },
          { name: 'bioHtml', type: 'text', isNullable: true },
          { name: 'experience', type: 'text', isNullable: true },
          { name: 'sameAs', type: 'jsonb', isNullable: false, default: "'[]'" },
          { name: 'metaTitle', type: 'varchar', length: '255', isNullable: true },
          { name: 'metaDescription', type: 'text', isNullable: true },
          { name: 'priority', type: 'int', isNullable: false, default: 0 },
          { name: 'isVisible', type: 'boolean', isNullable: false, default: true },
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
      'employees',
      new TableIndex({ name: 'IDX_EMPLOYEES_SLUG_UNIQUE', columnNames: ['slug'], isUnique: true }),
    );

    // ===== article_authors (many-to-many) =====
    await queryRunner.createTable(
      new Table({
        name: 'article_authors',
        columns: [
          { name: 'article_id', type: 'int', isPrimary: true },
          { name: 'employee_id', type: 'int', isPrimary: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'article_authors',
      new TableForeignKey({
        name: 'FK_ARTICLE_AUTHORS_ARTICLE',
        columnNames: ['article_id'],
        referencedTableName: 'articles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // удалили статью — связь просто исчезает
      }),
    );
    await queryRunner.createForeignKey(
      'article_authors',
      new TableForeignKey({
        name: 'FK_ARTICLE_AUTHORS_EMPLOYEE',
        columnNames: ['employee_id'],
        referencedTableName: 'employees',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT', // нельзя удалить сотрудника, пока у него есть статьи
      }),
    );
    await queryRunner.createIndex(
      'article_authors',
      new TableIndex({ name: 'IDX_ARTICLE_AUTHORS_EMPLOYEE', columnNames: ['employee_id'] }),
    );

    // ===== case_authors (many-to-many) =====
    await queryRunner.createTable(
      new Table({
        name: 'case_authors',
        columns: [
          { name: 'case_id', type: 'int', isPrimary: true },
          { name: 'employee_id', type: 'int', isPrimary: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'case_authors',
      new TableForeignKey({
        name: 'FK_CASE_AUTHORS_CASE',
        columnNames: ['case_id'],
        referencedTableName: 'cases',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // удалили кейс — связь просто исчезает
      }),
    );
    await queryRunner.createForeignKey(
      'case_authors',
      new TableForeignKey({
        name: 'FK_CASE_AUTHORS_EMPLOYEE',
        columnNames: ['employee_id'],
        referencedTableName: 'employees',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT', // нельзя удалить сотрудника, пока у него есть кейсы
      }),
    );
    await queryRunner.createIndex(
      'case_authors',
      new TableIndex({ name: 'IDX_CASE_AUTHORS_EMPLOYEE', columnNames: ['employee_id'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('case_authors', true);
    await queryRunner.dropTable('article_authors', true);
    await queryRunner.dropTable('employees', true);
  }
}
