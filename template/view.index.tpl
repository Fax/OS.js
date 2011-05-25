<div id="Desktop">
  <!-- Panel -->
  <div class="DesktopPanel AlignTop" id="Panel">

    <div class="PanelItem PanelItemMenu">
      <img alt="" src="/img/icons/16x16/categories/gnome-applications.png" title="Launch Application" />
    </div>

    <div class="PanelItem PanelItemSeparator">&nbsp;</div>

    <div class="PanelItemHolder PanelWindowHolder">
    </div>

    <div class="PanelItem PanelItemClock AlignRight">
      <span>31/01/00 00:00</span>
    </div>

    <div class="PanelItem PanelItemSeparator AlignRight">&nbsp;</div>

    <div class="PanelItemHolder PanelItemDock AlignRight">
      <div class="PanelItem PanelItemLauncher">
        <span class="launch_SystemSettings"><img alt="" src="/img/icons/16x16/categories/applications-system.png" title="System Settings" /></span>
      </div>
      <div class="PanelItem PanelItemLauncher">
        <span class="launch_SystemUser"><img alt="" src="/img/icons/16x16/apps/user-info.png" title="User Information" /></span>
      </div>
      <div class="PanelItem PanelItemLauncher">
        <span class="launch_SystemLogout"><img alt="" src="/img/icons/16x16/actions/gnome-logout.png" title="Save and Quit" /></span>
      </div>
    </div>
  </div>

  <div id="ContextMenu">
  </div>

  <!-- Content -->
</div>

<!-- Console -->
<div id="Console">
</div>

<!-- Loading -->
<div id="Loading" style="display:none">
  <div id="LoadingBar"></div>
</div>

<!-- Templates -->
<div id="Window" style="display:none">
  <div class="Window">
    <div class="WindowTop">
      <div class="WindowTopInner">
        <img alt="" src="/img/icons/16x16/emblems/emblem-unreadable.png" />
        <span></span>
      </div>
      <div class="WindowTopControllers">
        <div class="WindowTopController ActionMinimize">
          <span>_</span>
        </div>
        <div class="WindowTopController ActionClose">
          <span>x</span>
        </div>
      </div>
    </div>
    <div class="WindowMenu">
      <ul class="Top">
        <!--
        <li class="Top">
          <span class="Top">File</span>
          <ul class="Menu">
            <li><span>Close</span></li>
          </ul>
        </li>
        -->
      </ul>
    </div>
    <div class="WindowContent">
      <div class="WindowContentInner">
      </div>
    </div>
    <div class="WindowBottom">
      <div class="WindowBottomInner">
      </div>
    </div>
  </div>
</div>

<div id="Dialog" style="display:none">
  <div class="Window Dialog">
    <div class="WindowTop">
      <div class="WindowTopInner">
        <span></span>
      </div>
      <div class="WindowTopControllers">
        <div class="WindowTopController ActionClose">
          <span>x</span>
        </div>
      </div>
    </div>
    <div class="WindowContent">
      <div class="WindowContentInner">
        <div class="DialogContent">
          This is a dialog!
        </div>
        <div class="DialogButtons">
          <button class="Choose" style="display:none;">Choose</button>
          <button class="Close">Close</button>
          <button class="Ok" style="display:none;">Ok</button>
          <button class="Cancel" style="display:none;">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</div>
