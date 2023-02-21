/**
 * This file contains the API calls for the weather data
 * The API is documented here: https://www.weather.gov/documentation/services-web-api
 * */

export interface WeatherPeriod {
  number: number;
  name: string;
  detailedForecast: string;
  high: string;
  low: string;
}

export interface Zone {
  name: string;
  id: string;
}

class WeatherAPI {
  /**
   * Get the weather forecast for a given zone
   * @param zone The zone to get the forecast for
   * @returns An array of weather periods
   * */
  static async getWeather(zone: string): Promise<WeatherPeriod[]> {
    const response = await fetch(
      `https://api.weather.gov/zones/land/${zone}/forecast`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Regex to extract the high and low temperatures from the detailed forecast
    const highTempRegex = /[H|h]igh?[\s\w]+?(\d+s?|zero)(\s+to\s+\d+|zero)?\b/;
    const lowTempRegex = /[L|l]ow?[\s\w]+?(\d+s?|zero)(\s+to\s+\d+|zero)?\b/;
    const constTempRegex =
      /temperature[\s\w]+?(\d+s?|zero)(\s+to\s+\d+|zero)?\b/;

    // Map the periods to a more usable format
    const periods = data.properties.periods.map((period: any) => {
      const highTempMatch = period.detailedForecast.match(highTempRegex);
      const lowTempMatch = period.detailedForecast.match(lowTempRegex);
      const constTempMatch = period.detailedForecast.match(constTempRegex);

      // If there is a constant temperature, use that instead of the high/low
      if (constTempMatch && !highTempMatch && !lowTempMatch) {
        const temp = this.cleanTemperature(
          constTempMatch[1] + (constTempMatch[2] || '')
        );
        return {
          number: period.number,
          name: period.name,
          detailedForecast: period.detailedForecast,
          high: temp,
          low: temp,
        };
      } else {
        const highTemp = highTempMatch
          ? this.cleanTemperature(highTempMatch[1] + (highTempMatch[2] || ''))
          : '';
        const lowTemp =
          lowTempMatch && !highTempMatch
            ? this.cleanTemperature(lowTempMatch[1] + (lowTempMatch[2] || ''))
            : '';
        return {
          number: period.number,
          name: period.name,
          detailedForecast: period.detailedForecast,
          high: highTemp,
          low: lowTemp,
        };
      }
    });

    return periods;
  }

  /**
   * Get the zones for a given area
   * @param area The area to get the zones for
   * @returns An array of zones
   * */
  static async getZone(area: string): Promise<Zone[]> {
    const response = await fetch(
      `https://api.weather.gov/zones?area=${area}&type=land`
    );
    const data = await response.json();
    const counties = data.features.map((feature: any) => {
      return {
        name: feature.properties.name,
        id: feature.properties.id,
      };
    });
    return counties;
  }

  private static cleanTemperature(temp: string): string {
    return temp.replace('zero', '0');
  }
}

export default WeatherAPI;
