import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class DropOrderIndexFromCaseFaq1783400000000
  implements MigrationInterface
{
  name = 'DropOrderIndexFromCaseFaq1783400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('case_faq', 'order_index');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'case_faq',
      new TableColumn({
        name: 'order_index',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
    );
  }
}
