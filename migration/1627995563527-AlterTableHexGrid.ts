import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableHexGrid1627995563527 implements MigrationInterface {
    name = 'AlterTableHexGrid1627995563527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `hex_grid_name` `site_name` varchar(255) NOT NULL DEFAULT ''");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `site_name` `site_name` varchar(255) NOT NULL COMMENT '和 CMS 管理的站点名称保持一致' DEFAULT ''");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `username` `username` varchar(255) NOT NULL COMMENT '作为社交网络 @ 的身份定位' DEFAULT ''");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `subdomain` `subdomain` varchar(255) NOT NULL COMMENT '子域名。和 username 可以不同。配合系统分配的域名使用。如果用户彻底替换了域名，这个也要保留，以后可以回退到系统分配的域名' DEFAULT ''");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `meta_space_site_id` `meta_space_site_id` int NOT NULL COMMENT '关联站点ID。站点管理相关 API' DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `meta_space_site_url` `meta_space_site_url` varchar(255) NOT NULL COMMENT '站点URL。违反了第三范式。在这张表起到索引作用。需要和 CMS 服务同步站点信息' DEFAULT ''");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `meta_space_site_proof_url` `meta_space_site_proof_url` varchar(255) NOT NULL COMMENT '站点归属验证用URL。用于后续外部站点接入验证所有权' DEFAULT ''");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `meta_space_site_proof_url` `meta_space_site_proof_url` varchar(255) NOT NULL DEFAULT ''");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `meta_space_site_url` `meta_space_site_url` varchar(255) NOT NULL DEFAULT ''");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `meta_space_site_id` `meta_space_site_id` int NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `subdomain` `subdomain` varchar(255) NOT NULL DEFAULT ''");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `username` `username` varchar(255) NOT NULL DEFAULT ''");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `site_name` `site_name` varchar(255) NOT NULL DEFAULT ''");
        await queryRunner.query("ALTER TABLE `hex_grid` CHANGE `site_name` `hex_grid_name` varchar(255) NOT NULL DEFAULT ''");
    }

}
