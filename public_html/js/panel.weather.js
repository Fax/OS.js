/**
 * PanelItem: Weather
 *
 * Uses geolocation API and geonames to figure out weather
 *
 * @package ajwm.Panel
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var PanelItemWeather = (function($, undefined) {
  return function(_PanelItem, panel, api, argv) {
    var _PanelItemWeather = _PanelItem.extend({
      init : function() {
        this._super("PanelItemWeather", "right");

        this.named        = "Weather";
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

        span.attr("title", "Loading...");
        span.html("Loading...");
        img.attr("src", self.getImage("severe-alert"));

        $.ajax({
          'type' : 'post',
          'url'  : '/',
          'data' : {'ajax' : true, 'action' : 'call', 'method' : 'readurl', 'args' : url},
          success : function(data) {
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
                self.crash("No Weather data");
              }
            } else {
              self.crash("No Weather data");
            }
          },
          error : function() {
            self.crash("No Weather data");
          }
        });
      },

      poll : function() {
        var self = this;

        navigator.geolocation.getCurrentPosition(function(position) {
          self.parse(position.coords.latitude, position.coords.longitude);
        }, function() {
          self.crash("No Weather data");
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
          self.crash("Not supported!");
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
          'title'    : 'Reload',
          'disabled' : self._crashed,
          'method'   : function() { self.poll(); }
        });

        return ret;
      }
    });

    return construct(_PanelItemWeather, argv);
  };
})($);
