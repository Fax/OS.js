<?php
/*!
 * @file
 * Contains SessionViewController Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-02-20
 */

/**
 * SessionViewController Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package ajwm.Controllers.Session
 * @class
 */
class SessionViewController
  extends ApplicationController
{

  /**
   * @see ApplicationController::doGET()
   */
  public function doGET(Array $args, WebApplication $wa, $cached = false) {
    if ( isset($args['logout']) ) {
      $wa->logout();

      $title = "Logout successfull!";
      $message = "You have been logged out.";

      return Response::create(true, "/", $title, $message);
    } else {
      if ( $wa->getUser() ) {
        return Response::create(false, "/user/");
      }

      if ( $this->_oView->getPage() == "login" ) {
        $elements = Array(
          FormElement::create("varchar", "string", "username", "", true),
          FormElement::create("varchar", "password", "password", "", true),
        );
        $elements[1]->setAutocomplete(true);
        $form = Form::create($elements, "", "");
        $form->setSubmitLabel("Login");
        $form->setShowRequires(false);

        $this->_oView->setViewObjectForm($form);
        $this->_oView->setPage("login");
      } else if (  $this->_oView->getPage() == "register" ) {
        $obj = new User();
        $form = Form::createFromModel($obj);
        $form->removeElements(Array("Active", "Privilege", "LastSession", "LastIp"), true);
        /*
        $form->addElement(FormElement::create("varchar", "password", "PasswordRepeat", null, true));
        $form->getElement("Password")->setMatchElement("PasswordRepeat");
        $form->getElement("Password")->setValue("");
        $form->getElement("PasswordRepeat")->setValue("");
         */
        $this->_oView->setViewObjectForm($form);
        $this->_oView->setPage("register");
      } else {
        $elements = Array(
          FormElement::create("varchar", "string", "Cellphone", "", true)
        );
        $form = Form::create($elements);
        $form->setName("FormForgot");
        $form->setShowRequires(false);
        $this->_oView->setViewObjectForm($form);
        $this->_oView->setPage("forgot");
      }
    }

    return true;
  }

  /**
   * @see ApplicationController::doPOST()
   */
  public function doPOST(Array $args, WebApplication $wa) {
    if ( sizeof($args) ) {
      if ( isset($args['username']) && isset($args['password']) ) {
        $result   = false;
        $redirect = "";
        $title    = "Login failed!";
        $message  = "Invalid username or password.";

        if ( $u = UserQuery::getByLogin($args['username'], $args['password']) ) {
          $result   = true;
          $redirect = isset($_GET['ref']) ? urldecode($_GET['ref']) : "/user/"; // @see ApplicationController
          $title    = "Login successfull!";
          $message  = "You are now logged in.";

          $wa->login($u);
        }

        return Response::create($result, $redirect, $title, $message);
      } else {
        if ( $form = $this->_oView->getViewObjectForm() ) {
          if ( $form->getName() == "FormForgot" ) {
          } else {
            $obj = new User();
            $obj->setActive(1);
            $obj->setPrivilege(User::PRIVILEGE_NORMAL);

            if ( $res = parent::_doSave($args, $form, $obj) ) {
              if ( $u = $res->getResult() ) {
                $wa->login($u);
                $res->setRedirect("/user/");
              }
            }

            return $res;
          }
        }
      }

      return true;
    }

    return false;
  }

}

?>
