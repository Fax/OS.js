<?php

/**
 * Data object containing the SQL and PHP code to migrate the database
 * up to version 1306200075.
 * Generated on 2011-05-24 03:21:15 by anti-s
 */
class PropelMigration_1306200075
{

	public function preUp($manager)
	{
		// add the pre-migration code here
	}

	public function postUp($manager)
	{
		// add the post-migration code here
	}

	public function preDown($manager)
	{
		// add the pre-migration code here
	}

	public function postDown($manager)
	{
		// add the post-migration code here
	}

	/**
	 * Get the SQL statements for the Up migration
	 *
	 * @return array list of the SQL strings to execute for the Up migration
	 *               the keys being the datasources
	 */
	public function getUpSQL()
	{
		return array (
  'ajwm' => '
# This is a fix for InnoDB in MySQL >= 4.1.x
# It "suspends judgement" for fkey relationships until are tables are set.
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `spool_mail` CHANGE `status` `status` TINYINT DEFAULT 0 NOT NULL;

ALTER TABLE `spool_sms` CHANGE `status` `status` TINYINT DEFAULT 0 NOT NULL;

ALTER TABLE `user` CHANGE `active` `active` TINYINT(1) DEFAULT 1 NOT NULL;

ALTER TABLE `user` ADD
(
	`saved_session` TEXT
);

ALTER TABLE `user` DROP `address`;

ALTER TABLE `user` DROP `address_secondary`;

ALTER TABLE `user` DROP `area_code`;

ALTER TABLE `user` DROP `area`;

ALTER TABLE `user` DROP `country`;

ALTER TABLE `user` DROP `telephone`;

# This restores the fkey checks, after having unset them earlier
SET FOREIGN_KEY_CHECKS = 1;
',
);
	}

	/**
	 * Get the SQL statements for the Down migration
	 *
	 * @return array list of the SQL strings to execute for the Down migration
	 *               the keys being the datasources
	 */
	public function getDownSQL()
	{
		return array (
  'ajwm' => '
# This is a fix for InnoDB in MySQL >= 4.1.x
# It "suspends judgement" for fkey relationships until are tables are set.
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `spool_mail` CHANGE `status` `status` TINYINT DEFAULT 0 NOT NULL;

ALTER TABLE `spool_sms` CHANGE `status` `status` TINYINT DEFAULT 0 NOT NULL;

ALTER TABLE `user` CHANGE `active` `active` TINYINT(1) DEFAULT 1 NOT NULL;

ALTER TABLE `user` ADD
(
	`address` VARCHAR(128) NOT NULL,
	`address_secondary` VARCHAR(128),
	`area_code` VARCHAR(32) NOT NULL,
	`area` VARCHAR(64) NOT NULL,
	`country` VARCHAR(64) NOT NULL,
	`telephone` VARCHAR(64)
);

ALTER TABLE `user` DROP `saved_session`;

# This restores the fkey checks, after having unset them earlier
SET FOREIGN_KEY_CHECKS = 1;
',
);
	}

}