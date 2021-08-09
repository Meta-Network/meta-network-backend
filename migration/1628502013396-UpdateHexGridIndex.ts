import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateHexGridIndex1628502013396 implements MigrationInterface {
    name = 'UpdateHexGridIndex1628502013396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_84c1cf4231c2e39f1b08b5e6fd` ON `hex_grid`");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `site_name` `site_name` varchar(255) NOT NULL COMMENT '和CMS管理的站点名称保持一致' DEFAULT ''");
        await queryRunner.query("CREATE INDEX `IDX_84c1cf4231c2e39f1b08b5e6fd` ON `hex_grid` (`subdomain`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_84c1cf4231c2e39f1b08b5e6fd` ON `hex_grid`");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `site_name` `site_name` varchar(255) NOT NULL COMMENT '和 CMS 管理的站点名称保持一致' DEFAULT ''");
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_84c1cf4231c2e39f1b08b5e6fd` ON `hex_grid` (`subdomain`)");
    }

}
