import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToUsers1762503840531 implements MigrationInterface {
    name = 'AddSoftDeleteToUsers1762503840531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`deleted_at\` datetime(6) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`created_at\``);
    }

}
