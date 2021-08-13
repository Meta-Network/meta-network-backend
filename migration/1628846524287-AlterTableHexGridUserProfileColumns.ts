import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableHexGridUserProfileColumns1628846524287 implements MigrationInterface {
    name = 'AlterTableHexGridUserProfileColumns1628846524287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `hex_grid` ADD `user_nickname` varchar(255) NOT NULL COMMENT '用户昵称，作为搜索条件' DEFAULT ''");
        await queryRunner.query("ALTER TABLE `hex_grid` ADD `user_bio` varchar(255) NOT NULL COMMENT '用户简介' DEFAULT ''");
        await queryRunner.query("ALTER TABLE `hex_grid` ADD `user_avatar` varchar(255) NOT NULL COMMENT '用户虚拟形象' DEFAULT ''");
        await queryRunner.query("CREATE INDEX `IDX_1861a740a62a363605f2518bef` ON `hex_grid` (`user_nickname`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_1861a740a62a363605f2518bef` ON `hex_grid`");
        await queryRunner.query("ALTER TABLE `hex_grid` DROP COLUMN `user_avatar`");
        await queryRunner.query("ALTER TABLE `hex_grid` DROP COLUMN `user_bio`");
        await queryRunner.query("ALTER TABLE `hex_grid` DROP COLUMN `user_nickname`");
    }

}
