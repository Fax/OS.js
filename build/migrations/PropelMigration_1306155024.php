<?php

/**
 * Data object containing the SQL and PHP code to migrate the database
 * up to version 1306155024.
 * Generated on 2011-05-23 14:50:24 by anti-s
 */
class PropelMigration_1306155024
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

CREATE TABLE `user`
(
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`username` VARCHAR(64) NOT NULL,
	`password` VARCHAR(36) NOT NULL,
	`privilege` TINYINT NOT NULL,
	`name` VARCHAR(128) NOT NULL,
	`email` VARCHAR(255) NOT NULL,
	`company_name` VARCHAR(128),
	`address` VARCHAR(128) NOT NULL,
	`address_secondary` VARCHAR(128),
	`area_code` VARCHAR(32) NOT NULL,
	`area` VARCHAR(64) NOT NULL,
	`country` VARCHAR(64) NOT NULL,
	`telephone` VARCHAR(64),
	`cellphone` VARCHAR(64) NOT NULL,
	`active` TINYINT(1) DEFAULT 1 NOT NULL,
	`last_session` VARCHAR(64),
	`last_ip` VARCHAR(15),
	`deleted_on` DATETIME,
	`last_activity_on` DATETIME,
	PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `user_setting`
(
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`user_id` INTEGER,
	`key` VARCHAR(64) NOT NULL,
	`value` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`id`),
	INDEX `user_setting_FI_1` (`user_id`),
	CONSTRAINT `user_setting_FK_1`
		FOREIGN KEY (`user_id`)
		REFERENCES `user` (`id`)
		ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `spool_mail`
(
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`status` TINYINT DEFAULT 0 NOT NULL,
	`log` TEXT,
	`content` TEXT NOT NULL,
	`created_at` DATETIME,
	`updated_at` DATETIME,
	PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `spool_sms`
(
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`status` TINYINT DEFAULT 0 NOT NULL,
	`log` TEXT,
	`content` TEXT NOT NULL,
	`created_at` DATETIME,
	`updated_at` DATETIME,
	PRIMARY KEY (`id`)
) ENGINE=InnoDB;

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

DROP TABLE IF EXISTS `user`;

DROP TABLE IF EXISTS `user_setting`;

DROP TABLE IF EXISTS `spool_mail`;

DROP TABLE IF EXISTS `spool_sms`;

# This restores the fkey checks, after having unset them earlier
SET FOREIGN_KEY_CHECKS = 1;
',
);
	}

}