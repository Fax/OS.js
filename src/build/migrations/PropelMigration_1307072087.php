<?php

/**
 * Data object containing the SQL and PHP code to migrate the database
 * up to version 1307072087.
 * Generated on 2011-06-03 05:34:47 by anti-s
 */
class PropelMigration_1307072087
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

ALTER TABLE `user` CHANGE `active` `active` TINYINT(1) DEFAULT 1 NOT NULL;

CREATE TABLE `location`
(
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`ccode` VARCHAR(255) NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	`state` VARCHAR(255) NOT NULL,
	`country` VARCHAR(255) NOT NULL,
	`url` VARCHAR(255) NOT NULL,
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

DROP TABLE IF EXISTS `location`;

ALTER TABLE `user` CHANGE `active` `active` TINYINT(1) DEFAULT 1 NOT NULL;

# This restores the fkey checks, after having unset them earlier
SET FOREIGN_KEY_CHECKS = 1;
',
);
	}

}