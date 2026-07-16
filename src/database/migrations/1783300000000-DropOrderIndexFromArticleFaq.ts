import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class DropOrderIndexFromArticleFaq1783300000000
  implements MigrationInterface
{
  name = 'DropOrderIndexFromArticleFaq1783300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('article_faq', 'order_index');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'article_faq',
      new TableColumn({
        name: 'order_index',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
    );
  }
}
