import {MigrationInterface, QueryRunner} from "typeorm";

export class AddHexGridArweaveTxTables1638349421775 implements MigrationInterface {
    name = 'AddHexGridArweaveTxTables1638349421775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `hex_grid_batch_tx_entity` (`id` int NOT NULL AUTO_INCREMENT, `tx` varchar(255) NOT NULL, UNIQUE INDEX `IDX_162ffd54ffa6f3f3c5b90290c6` (`tx`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `hex_grid_pending_entity` (`id` int NOT NULL, `properties` json NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `hex_grid_transaction_reference_entity` (`id` int NOT NULL, `tx` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `hex_grid_transaction_reference_entity`");
        await queryRunner.query("DROP TABLE `hex_grid_pending_entity`");
        await queryRunner.query("DROP INDEX `IDX_162ffd54ffa6f3f3c5b90290c6` ON `hex_grid_batch_tx_entity`");
        await queryRunner.query("DROP TABLE `hex_grid_batch_tx_entity`");
    }

}
