const Manager = require("../Manager.js");
const Discord = require("discord.js");
const cities = require('cities');
const Forecast = require('forecast');
class WeatherManager extends Manager {
    constructor(pramas) {
        super(pramas);
        console.log("Loaded!");
        this.defaultConfig = {
          prefix: "weather"
        };

        this.disnode.command.on("Command_weather", this.getWeather)
        this.getWeather = this.getWeather.bind(this);}


    getWeather(data){
      var forecast = new Forecast({
          service: 'darksky',
          key: '260074f12477030ea66eaf730cc87c48',
          units: 'fahrenheit'
        });


      var self = this;
      if(!data.params[0]){
        self.disnode.service.SendMessage("Please Enter Zip!", data.msg);
        return;
      }
      var city = cities.zip_lookup(data.params[0]);

      if(!city){
        self.disnode.service.SendMessage("No City for: " + data.params[0], data.msg);
        return;
      }

      forecast.get([city.latitude, city.longitude], function(err, weather) {
          if (err) return console.dir(err);
          var tempC = weather.currently.temperature.toFixed(2) + "° c";
          var tempF = ((weather.currently.temperature*1.8 ) + 32).toFixed(2) + "° f";

          self.disnode.service.SendMessage("Weather for **_"+city.city + ", "+ city.state+"_**: \n"
            + "**Condition:** *" + weather.currently.summary +"*\n"
            + "**Temp:** *" + tempF + " ["+tempC+"]" +"*\n"
            + "**Wind:** *" + weather.currently.windSpeed +"*\n", data.msg);
      });

    }

}
module.exports = WeatherManager;
