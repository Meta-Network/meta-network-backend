import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTableSyncTask1629204446067 implements MigrationInterface {
    name = 'CreateTableSyncTask1629204446067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `sync_task` (`created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `type` int NOT NULL COMMENT '同步任务类型：0 - 默认; 1 - 用户信息; 2 - 站点信息' DEFAULT '0', `state` int NOT NULL COMMENT '同步任务状态：0 - 待执行; 1 - 执行中; 2 - 成功; 3 - 失败' DEFAULT '0', `count` int NOT NULL COMMENT '同步条数' DEFAULT '0', INDEX `IDX_05b040efb44cdd4773edb72af4` (`type`), INDEX `IDX_fcb85116a3848bd54c07cd66b8` (`type`, `state`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_fcb85116a3848bd54c07cd66b8` ON `sync_task`");
        await queryRunner.query("DROP INDEX `IDX_05b040efb44cdd4773edb72af4` ON `sync_task`");
        await queryRunner.query("DROP TABLE `sync_task`");
    }

}
