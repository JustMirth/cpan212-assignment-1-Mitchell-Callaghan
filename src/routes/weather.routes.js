import { Router } from 'express';
import { parseCity, parseCities } from '../validators/weather-query.js';
import { getCityWeather } from '../lib/weather.js';

export const weatherRouter = Router();

// TODO (you): GET /api/weather?city=Toronto
// Validate with parseCity, get the summary with getCityWeather, and respond
// with { data, attribution }. Routes never call fetch themselves.
weatherRouter.get('/weather', async (req, res, next) => {
  try {
    const city = parseCity(req.query.city);
    const weather = await getCityWeather(city);
    res.status(200).json({ data: weather, attribution: 'Weather data provided by Open-Meteo.com (https://open-meteo.com/)' });
  } catch (err) {
    next(err);
  }
});

// TODO (you): GET /api/compare?cities=Toronto,Vancouver,Halifax
// Validate with parseCities, start every lookup at once with Promise.allSettled,
// then build the cities array and the summary described on the assignment page.
weatherRouter.get('/compare', async (req, res, next) => {
  try {
    const cities = parseCities(req.query.cities);
    const results = await Promise.allSettled(cities.map(city => getCityWeather(city)));
    const cityResults = results.map((result, index) => {
      const city = cities[index];

      if (result.status === 'fulfilled') {
        return { city, ok: true, weather: result.value };
      }

      const error = result.reason;
      return { city, ok: false, error: { status: error.status || 500, message: error.status ? error.message : 'Internal Server Error' } };
    });
  
    const successful = cityResults.filter(result => result.ok);
    let warmest = null;
    let coldest = null;

    for (const result of successful) {
      if (warmest === null || result.weather.current.temperatureC > warmest.weather.current.temperatureC) {warmest = result;}
      if (coldest === null || result.weather.current.temperatureC < coldest.weather.current.temperatureC) {coldest = result;}
    }

    res.status(200).json({ 
        data: {
          cities: cityResults,
            summary: { 
              succeeded: successful.length,
              failed: cityResults.length - successful.length,
              warmest: warmest ? warmest.weather.location.name : null,
              coldest: coldest ? coldest.weather.location.name : null 
            }
        },
        attribution: 'Weather data provided by Open-Meteo.com (https://open-meteo.com/)'
      });
  } catch (err) {
    next(err);
  }
});
