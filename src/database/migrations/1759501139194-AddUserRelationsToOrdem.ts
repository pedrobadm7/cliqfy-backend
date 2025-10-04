import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddUserRelationsToOrdem1759501139194
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'ordem',
      new TableColumn({
        name: 'criado_por_id',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'ordem',
      new TableColumn({
        name: 'responsavel_id',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'ordem',
      new TableColumn({
        name: 'data_atualizacao',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: false,
      }),
    );

    await queryRunner.createForeignKey(
      'ordem',
      new TableForeignKey({
        name: 'FK_ordem_criado_por',
        columnNames: ['criado_por_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'ordem',
      new TableForeignKey({
        name: 'FK_ordem_responsavel',
        columnNames: ['responsavel_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('ordem', 'FK_ordem_criado_por');
    await queryRunner.dropForeignKey('ordem', 'FK_ordem_responsavel');

    await queryRunner.dropColumn('ordem', 'criado_por_id');
    await queryRunner.dropColumn('ordem', 'responsavel_id');
    await queryRunner.dropColumn('ordem', 'data_atualizacao');
  }
}
