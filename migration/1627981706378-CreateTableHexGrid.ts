import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTableHexGrid1627981706378 implements MigrationInterface {
    name = 'CreateTableHexGrid1627981706378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `hex_grid` (`id` int NOT NULL AUTO_INCREMENT, `hex_grid_name` varchar(255) NOT NULL DEFAULT '', `x` int NOT NULL, `y` int NOT NULL, `z` int NOT NULL, `user_id` int NOT NULL DEFAULT '0', `username` varchar(255) NOT NULL DEFAULT '', `subdomain` varchar(255) NOT NULL DEFAULT '', `meta_space_site_id` int NOT NULL DEFAULT '0', `meta_space_site_url` varchar(255) NOT NULL DEFAULT '', `meta_space_site_proof_url` varchar(255) NOT NULL DEFAULT '', `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_d2f84ff4121d6d4f378209e342` (`user_id`), INDEX `IDX_971eee425c7d2563d51c86b9a5` (`username`), UNIQUE INDEX `IDX_84c1cf4231c2e39f1b08b5e6fd` (`subdomain`), INDEX `IDX_39a5348667842d9935f79197be` (`meta_space_site_id`), INDEX `IDX_900a2b63cc7c43a69dcfffbdf4` (`meta_space_site_url`), UNIQUE INDEX `IDX_e28d20a9d4215f6fb129902232` (`x`, `y`, `z`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_e28d20a9d4215f6fb129902232` ON `hex_grid`");
        await queryRunner.query("DROP INDEX `IDX_900a2b63cc7c43a69dcfffbdf4` ON `hex_grid`");
        await queryRunner.query("DROP INDEX `IDX_39a5348667842d9935f79197be` ON `hex_grid`");
        await queryRunner.query("DROP INDEX `IDX_84c1cf4231c2e39f1b08b5e6fd` ON `hex_grid`");
        await queryRunner.query("DROP INDEX `IDX_971eee425c7d2563d51c86b9a5` ON `hex_grid`");
        await queryRunner.query("DROP INDEX `IDX_d2f84ff4121d6d4f378209e342` ON `hex_grid`");
        await queryRunner.query("DROP TABLE `hex_grid`");
    }

}
