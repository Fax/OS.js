<?php



/**
 * Skeleton subclass for representing a row from the 'user_setting' table.
 *
 * 
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.pitchlabs
 */
class UserSetting extends BaseUserSetting {

  public static $AvailableSettings = Array(
    "desktop.wallpaper.path"   => ""
  );

  public static $DefaultSettings = Array(
    "desktop.wallpaper.path"   => "02555_cherryblossoms_2560x1600.jpg"
  );

  public static $LabelSettings = Array(
    "desktop.wallpaper.path"   => "Wallpaper Path"
  );

  public static $ValueSettings = Array(
  );

  public final static function getUserSettings(User $u = null) {
    $settings = self::$DefaultSettings;

    if ( $u !== null ) {
      if ( $res = UserSettingQuery::create()->findByUser($u) ) {
        foreach ( $res as $r ) {
          if ( isset($settings[$r->getKey()]) ) {
            $settings[$r->getKey()] = $r->getValue();
          }
        }
      }
    }

    return $settings;
  }

  public final static function saveUserSettings(User $u, Array $settings) {
    UserSettingQuery::create()->findByUser($u)->delete();

    foreach ( $settings as $key => $value ) {
      if ( $value != self::$DefaultSettings[$key] ) {
        $s = new UserSetting();
        $s->setUser($u);
        $s->setKey($key);
        $s->setValue($value);
        $s->save();
      }
    }

    return self::getUserSettings($u);
  }

} // UserSetting
