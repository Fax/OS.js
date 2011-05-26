<?php



/**
 * Skeleton subclass for representing a row from the 'user' table.
 *
 * 
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.MyApplication
 */
class User extends BaseUser {

  const PRIVILEGE_NONE          = 0;  //!< Privilege: Not logged in
  const PRIVILEGE_NORMAL        = 1;  //!< Privilege: Registered user
  const PRIVILEGE_SUPERUSER     = 2;  //!< Privilege: Superuser
  const PRIVILEGE_ADMINISTRATOR = 4;  //!< Privilege: Administrator

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Registered default privileges
   * @var Array
   */
  public static $Privileges = Array(
    self::PRIVILEGE_NONE          => "None",
    self::PRIVILEGE_NORMAL        => "Normal user",
    self::PRIVILEGE_SUPERUSER     => "Superuser",
    self::PRIVILEGE_ADMINISTRATOR => "Administrator"
  );

  /////////////////////////////////////////////////////////////////////////////
  // STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////
  // CLASS METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Check if user is: Normal User
   * @return bool
   */
  public function isNormalUser() {
    return ($this->getPrivilege() >= self::PRIVILEGE_NORMAL);
  }

  /**
   * Check if user is: Super User
   * @return bool
   */
  public function isSuperUser() {
    return ($this->getPrivilege() >= self::PRIVILEGE_SUPERUSER);
  }

  /**
   * Check if user is: Admin User
   * @return bool
   */
  public function isAdministratorUser() {
    return ($this->getPrivilege() >= self::PRIVILEGE_ADMINISTRATOR);
  }

  public final function getUserGroupsInner() {
    $res = new PropelObjectCollection();
    foreach ( parent::getUserGroups() as $g )
      $res[] = $g->getGroup();
    return $res;
  }

  /////////////////////////////////////////////////////////////////////////////
  // SET
  /////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////
  // GET
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get the privilege name
   * @return String
   */
  public final function getPrivilegeType() {
    return self::$Privileges[$this->getPrivilege()];
  }

  public final function getLastActivityDate() {
    if ( !parent::getLastActivityOn() )
      return "";
    return Utilities::date_diff(parent::getLastActivityOn(), new DateTime());
  }

} // User
