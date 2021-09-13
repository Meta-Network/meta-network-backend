import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableHexGridAddColumnInviterUserId1631512778830 implements MigrationInterface {
    name = 'AlterTableHexGridAddColumnInviterUserId1631512778830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `hex_grid` ADD `inviter_user_id` int NOT NULL DEFAULT '0'");
        await queryRunner.query("CREATE INDEX `IDX_942d277c764ce49911ab95a3ea` ON `hex_grid` (`inviter_user_id`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_942d277c764ce49911ab95a3ea` ON `hex_grid`");
        await queryRunner.query("ALTER TABLE `hex_grid` DROP COLUMN `inviter_user_id`");
    }

}
