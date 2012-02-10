/*!
 * OS.js - JavaScript Operating System - Translation (nb_NO - UTF8)
 *
 * Copyright (c) 2011, Anders Evenrud
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @package OSjs.Core.Locale
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */
(function($, undefined) {

  // Labels
  OSjs.Labels = {
    "ApplicationCheckCompabilityMessage"  : "Nettleseren din støtter ikke '%s'",
    "ApplicationCheckCompabilityStack"    : "Application::_checkCompability(): Applikasjon navn: %s",
    "CrashApplication"                    : "Applikasjon '%s' har stoppet med feilmeldingen '%s'!",
    "CrashApplicationResourceMessage"     : "En eller flere av disse ressursjene ble ikke lastet::\n%s",
    "CrashApplicationResourceStack"       : "[LaunchApplication]API::system::launch()\n  Applikasjon: %s\n  Argumenter: %s",
    "CrashApplicationOpen"                : "Kan ikke åpne '%s' med MIME '%s' med denne applikasjonen",
    "ErrorLaunchString"                   : "Kan ikke starte '%s'. Ugyldig operasjon!",
    "InitLaunchError"                     : "Kan ikke kjøre '%s'.\nMaks antall prosesser er: %d",
    "WindowManagerMissing"                : "Kan ikke utføre denne operasjonen fordi Vindus-håndteren ikke kjører.",
    "WentOffline"                         : "Du mistet tilkoblingen. Gjenoprett internett-tilkoblingen for å fortsette å bruke OS.js",
    "WentOnline"                          : "Tilkobling er gjenopprettet!",
    "Quit"                                : "Er du sikker på at du vil avslutte? For å lagre sessjonen din må du bruke utlogging.",
    "PanelItemRemove"                     : "Er du sikker på at du vil fjerne denne?",
    "WebWorkerError"                      : "En feil skjedde under håndtering av WebWorker-skript '%s' på linje %d",
    "StorageWarning"                      : "Advarsel! Du er snart tom for 'local-storage' plass (%d av %d)",
    "StorageAlert"                        : "Advarsel! Du har nådd 'local-storage' lagrings-grense (%d av %d)",
    "CrashEvent"                          : "En feil oppstod under en AJAX-hendelse: ",
    "CrashEventTitle"                     : "En operasjon i '%s' har feilet!",
    "CrashDesktopIconView"                : "En feil oppstod under oppretting av skrivebordets IconView!",
    "CrashPanelCreate"                    : "En feil oppstod under oppretting av panel(er)!",
    "CrashPanelStart"                     : "En feil oppstod under starting av panel(er)!",
    "ContextMenuPanel"                    : {
      "title"     : "Panel",
      "add"       : "Legg til",
      "create"    : "Nytt panel",
      "remove"    : "Fern panel"
    },
    "ContextMenuDesktop"                  : {
      "title"     : "Skrivebord",
      "wallpaper" : "Endre Bakgrunn",
      "sort"      : "Sorter vinduer"
    },
    "ContextMenuWindowMenu"               : {
      "max"     : "Maksimer",
      "min"     : "Minimer",
      "restore" : "Gjenoprett",
      "show"    : "Vis",
      "ontop"   : "Alltid på topp",
      "same"    : "Samme som andre",
      "close"   : "Lukk"
    },
    "DialogTitles"                        : {
      "info"      : "Informasjon",
      "error"     : "Feil",
      "question"  : "Spørsmål",
      "confirm"   : "Bekreft",
      "warning"   : "Advarsel",
      "default"   : "Dialog"
    }
  };

  // Application Compability error exceptions
  OSjs.Public.CompabilityErrors = {
    "canvas"          : "<canvas> Context (2d)",
    "webgl"           : "<canvas> WebGL Context (3d)",
    "audio"           : "<audio> DOM Element",
    "audio_ogg"       : "<audio> Støtter ikke OGG/Vorbis",
    "audio_mp3"       : "<audio> Støtter ikke MPEG/MP3",
    "video"           : "<video> DOM Element",
    "video_webm"      : "<video> Støtter ikke VP8/WebM",
    "video_ogg"       : "<video> Støtter ikke OGG/Vorbis",
    "video_mpeg"      : "<video> Støtter ikke MP4/MPEG/h264",
    "video_mkv"       : "<video> Støtter ikke MKV",
    "localStorage"    : "window.localStorage()",
    "sessionStorage"  : "window.sessionStorage()",
    "globalStorage"   : "window.globalStorage()",
    "databaseStorage" : "window.databaseStorage()",
    "socket"          : "window.WebSocket()",
    "richtext"        : "window.contentEditable (Rich Text Editing)",
    "upload"          : "Asynkrone Fil-opplastinger",
    "worker"          : "Web Workers"
  };

  /////////////////////////////////////////////////////////////////////////////
  // DIALOGS
  /////////////////////////////////////////////////////////////////////////////

  OSjs.Labels.DialogButtons = {
    "Choose" : "Velg",
    "Ok"     : "Ok",
    "Close"  : "Lukk",
    "Cancel" : "Avbryt"
  };

  /////////////////////////////////////////////////////////////////////////////
  // Gtk
  /////////////////////////////////////////////////////////////////////////////

  OSjs.Labels.GtkMenu = {
    "file"     : "<u>F</u>il",
    "new"      : "Ny",
    "open"     : "Åpne",
    "save"     : "Lagre",
    "saveas"   : "Lagre som..:",
    "close"    : "Lukk",
    "quit"     : "Avslutt",
    "home"     : "Hjem",
    "upload"   : "Last opp",
    "mkdir"    : "Opprett mappe",
    "listview" : "Liste-visning",
    "iconview" : "Ikon-visning",
    "add"      : "Legg til",
    "remove"   : "Fjern",
    "execute"  : "Start",
    "refresh"  : "Oppfrisk",
    "go"       : "<u>G</u>å",
    "view"     : "<u>V</u>isning",
    "help"     : "<u>H</u>jelp",
    "about"    : "Om forfatter"
  };

})();
