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
  static async getWeather(zone: string): Promise<WeatherPeriod[]> {
    const response = await fetch(
      `https://api.weather.gov/zones/land/${zone}/forecast`
    );
    const data = await response.json();

    // Regex to extract the high and low temperatures from the detailed forecast
    const highTempRegex = /[H|h]igh[\s\w]+?(\d+s?|zero)(\s+to\s+\d+|zero)?\b/;
    const lowTempRegex = /[L|l]ow[\s\w]+?(\d+s?|zero)(\s+to\s+\d+|zero)?\b/;

    // Map the periods to a more usable format
    const periods = data.properties.periods.map((period: any) => {
      const highTempMatch = period.detailedForecast.match(highTempRegex);
      const lowTempMatch = period.detailedForecast.match(lowTempRegex);

      const highTemp = highTempMatch
        ? (highTempMatch[1] + (highTempMatch[2] || '')).replace('zero', '0')
        : '';
      const lowTemp = lowTempMatch
        ? (lowTempMatch[1] + (lowTempMatch[2] || '')).replace('zero', '0')
        : '';

      return {
        number: period.number,
        name: period.name,
        detailedForecast: period.detailedForecast,
        high: highTemp,
        low: lowTemp,
      };
    });

    return periods;
  }

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
}

export default WeatherAPI;
