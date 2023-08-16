export interface infoLoc {
  name: string,
  region: string,
  country: string,
};

interface currentType {
  last_updated_epoch: number,
  last_updated: number,
  temp_c: number,
  temp_f: number,
  is_day: number,
  wind_kph: number,
  humidity: number,
  condition: Condition
}

interface Condition {
  text: string;
  icon: string;
  code: string;
}


interface Astro {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moon_phase: string;
  moon_illumination: string;
  is_moon_up: number;
  is_sun_up: number;
}

interface ForecastDay {
  date: string;
  date_epoch: number;
  astro: Astro;
}

interface Forecast {
  forecastday: ForecastDay[];
}

  export type Weather<T> ={
    WeatherType: T
 } 

export interface WeatherType {
  current: currentType;
  location: infoLoc;
  forecast: Forecast;
}