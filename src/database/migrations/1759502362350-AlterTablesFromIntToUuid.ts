import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTablesFromIntToUuid1759502362350
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.query(
      `ALTER TABLE "ordem" DROP CONSTRAINT IF EXISTS "FK_ordem_criado_por";`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordem" DROP CONSTRAINT IF EXISTS "FK_ordem_responsavel";`,
    );

    await queryRunner.query(`TRUNCATE TABLE "ordem" CASCADE;`);
    await queryRunner.query(`TRUNCATE TABLE "user" CASCADE;`);

    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "id" TYPE uuid USING uuid_generate_v4();`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();`,
    );

    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "id" DROP DEFAULT;`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "id" TYPE uuid USING uuid_generate_v4();`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();`,
    );

    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "criado_por_id" TYPE uuid USING uuid_generate_v4();`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "responsavel_id" TYPE uuid USING uuid_generate_v4();`,
    );

    await queryRunner.query(`
          ALTER TABLE "ordem" 
          ADD CONSTRAINT "FK_ordem_criado_por" 
          FOREIGN KEY ("criado_por_id") 
          REFERENCES "user"("id") 
          ON DELETE RESTRICT 
          ON UPDATE CASCADE;
        `);

    await queryRunner.query(`
          ALTER TABLE "ordem" 
          ADD CONSTRAINT "FK_ordem_responsavel" 
          FOREIGN KEY ("responsavel_id") 
          REFERENCES "user"("id") 
          ON DELETE SET NULL 
          ON UPDATE CASCADE;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ordem" DROP CONSTRAINT "FK_ordem_criado_por";`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordem" DROP CONSTRAINT "FK_ordem_responsavel";`,
    );

    await queryRunner.query(`TRUNCATE TABLE "ordem" CASCADE;`);
    await queryRunner.query(`TRUNCATE TABLE "user" CASCADE;`);

    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS user_id_seq;`);
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "id" TYPE int USING nextval('user_id_seq');`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT nextval('user_id_seq');`,
    );

    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS ordem_id_seq;`);
    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "id" TYPE int USING nextval('ordem_id_seq');`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "id" SET DEFAULT nextval('ordem_id_seq');`,
    );

    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "criado_por_id" TYPE int USING 1;`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "responsavel_id" TYPE int USING NULL;`,
    );

    await queryRunner.query(`
          ALTER TABLE "ordem" 
          ADD CONSTRAINT "FK_ordem_criado_por" 
          FOREIGN KEY ("criado_por_id") 
          REFERENCES "user"("id");
        `);

    await queryRunner.query(`
          ALTER TABLE "ordem" 
          ADD CONSTRAINT "FK_ordem_responsavel" 
          FOREIGN KEY ("responsavel_id") 
          REFERENCES "user"("id");
        `);
  }
}
