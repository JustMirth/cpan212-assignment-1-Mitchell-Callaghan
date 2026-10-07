import { config } from '../config.js';
import { geocodeCity, getForecast } from './open-meteo.js';
import { describeWeatherCode } from './weather-codes.js';
import { get, set, getStats } from './cache.js';

// TODO (you): create one cache for the whole app, with a time to live of
// config.cacheTtlSeconds.

// TODO (you): return the weather summary for one city, in the shape shown on
// the assignment page. Check the cache first. On a miss, geocode the city, get
// the forecast, build the summary, store it, and return it with cached: false.
// On a hit, return the stored summary with cached: true.
export async function getCityWeather(city) {
  const key = city.trim().toLowerCase();
  const cachedWeather = get(key);
  if (cachedWeather) {
    return { ...cachedWeather, cached: true };
  }

  const location = await geocodeCity(city);
  const forecast = await getForecast(location.latitude, location.longitude);

  const { current, daily } = forecast;
  
  const weather = {
    location: {
      name: location.name,
      region: location.region,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone
    },

    current: {
      time: current.time,
      temperatureC: current.temperature_2m,
      feelsLikeC: current.apparent_temperature,
      humidityPercent: current.relativehumidity_2m,
      windKmh: current.windspeed_10m,
      weatherCode: current.weathercode,
      condition: describeWeatherCode(current.weathercode)
    },
    
    daily: daily.time.map((date, index) => ({
      date,
      minC: daily.temperature_2m_min[index],
      maxC: daily.temperature_2m_max[index],
      precipitationChancePercent: daily.precipitation_probability_max[index] ?? null,
      weatherCode: daily.weathercode[index],
      condition: describeWeatherCode(daily.weathercode[index])
    })),
    
    fetchedAt: new Date().toISOString(),
    cached: false
  };

  set(key, weather);
  return weather;
}

// TODO (you): return the cache statistics for GET /api/cache/stats.
export function getCacheStats() {
  throw new Error('getCacheStats is not written yet');
}
