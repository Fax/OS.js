<?php



/**
 * Skeleton subclass for performing query and update operations on the 'user' table.
 *
 * 
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.MyApplication
 */
class UserQuery extends BaseUserQuery {

  /**
   * Create a new instance of User
   *
   * @return User
   */
  public final static function getByLogin($username, $password) {
    $password = call_user_func(DIGEST_METHOD, $password);

    if ( $user = UserQuery::create()->filterByActive(1)->filterByDeletedOn(null)->findOneByUsername($username) ) {
      if ( $user->getPrivilege() >= User::PRIVILEGE_NORMAL ) {
        if ( $user->getPassword() == $password ) {
          return $user;
        }
      }
    }

    return null;

  }

} // UserQuery
