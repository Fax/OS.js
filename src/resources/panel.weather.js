/*!
 * PanelItem: Weather
 *
 * Uses geolocation API and geonames to figure out weather
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
 * @package OSjs.Panel
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.PanelItems.PanelItemWeather = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = {
    "en_US" : {
      "title"       : "Weather",
      "loading"     : "Loading...",
      "no_data"     : "No Weather data",
      "no_support"  : "Not supported!",
      "reload"      : "Reload"
    },
    "nb_NO" : {
      "title"       : "Vær",
      "loading"     : "Laster...",
      "no_data"     : "Ingen værdata",
      "no_support"  : "Ikke støttet!",
      "reload"      : "Oppfrisk"
    }
  };

  return function(_PanelItem, panel, API, argv) {
    "_PanelItem:nomunge, panel:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var _PanelItemWeather = _PanelItem.extend({
      init : function() {
        this._super("PanelItemWeather", "right");

        this.named        = LABELS.title;
        this.interval     = null;
      },

      getImage : function(img) {
        return sprintf("/img/icons/16x16/status/weather-%s.png", img);
      },

      parse : function(lat, lng) {
        var self  = this;
        var url   = sprintf("http://api.geonames.org/findNearByWeatherJSON?lat=%s&lng=%s&username=demo", lat, lng);
        var span  = this.$element.find("span");
        var img   = this.$element.find("img");

        span.attr("title", LABELS.loading);
        span.html(LABELS.loading);
        img.attr("src", self.getImage("severe-alert"));

        var args = {'action' : 'call', 'method' : 'readurl', 'args' : url};
        API.system.post(args, function(data) {
          if ( data.success ) {
            var result = null;
            try {
              result = JSON.parse(data.result);
            } catch ( eee) {}

            if ( result && result.weatherObservation ) {
              var icon        = "severe-alert";

              var loc_name    = result.weatherObservation.stationName;
              var loc_country = result.weatherObservation.countryCode;
              var temp        = result.weatherObservation.temperature;
              var tempu       = "C";
              var clouds      = result.weatherObservation.clouds;
              var condition   = result.weatherObservation.weatherCondition;

              var icons_clouds = {
                "clear sky"             : "clear",
                "clear sky"             : "clear",
                "few clouds"            : "few-clouds",
                "scattered clouds"      : "few-clouds",
                "broken clouds"         : "few-clouds",
                "overcast"              : "overcast",
                "vertical visibility"   : "overcast"
              };
              var icons_conditions = {
                "drizzle"      : "showers-scattered",
                "rain"         : "showers",
                "showers"      : "showers",
                "show"         : "snow",
                "snow grains"  : "snow",
                "mist"         : "fog",
                "fog"          : "fog",
                "thunderstorm" : "storm"
              };

              if ( icons_clouds[clouds] ) {
                icon = icons_clouds[clouds];
              }
              if ( icons_conditions[condition] ) {
                icon = icons_conditions[condition];
              }

              img.attr("src", self.getImage(icon));
              span.attr("title", sprintf("%s, %s", loc_name, loc_country));
              span.html(sprintf("%s &deg;%s %s", temp, tempu, clouds));
            } else {
              self.crash(LABELS.no_data);
            }
          } else {
            self.crash(LABELS.no_data);
          }

          self.onRedraw();
        }, function() {
          self.crash(LABELS.no_data);
          self.onRedraw();
        });
      },

      poll : function() {
        var self = this;

        navigator.geolocation.getCurrentPosition(function(position) {
          self.parse(position.coords.latitude, position.coords.longitude);
        }, function() {
          self.crash(LABELS.no_data);
        });

      },

      create : function(pos) {
        var self = this;
        var ret = this._super(pos);

        $(ret).append("<img alt=\"\" src=\"/img/blank.gif\" /><span title=\"\">&nbsp;</span>");

        if ( navigator && navigator.geolocation ) {
          this.interval = setInterval(function() {
            self.poll();
          }, (60 * 1000) * 60);

          this.poll();
        } else {
          self.crash(LABELS.no_support);
        }

        return ret;
      },

      destroy : function() {
        if ( this.interval ) {
          clearInterval(this.interval);
        }

        this._super();
      },

      getMenu : function() {
        var self = this;
        var ret = this._super();

        ret.push("---");
        ret.push({
          'title'    : LABELS.reload,
          'disabled' : self._crashed,
          'method'   : function() { self.poll(); }
        });

        return ret;
      }
    });

    return construct(_PanelItemWeather, argv);
  };
})($);
