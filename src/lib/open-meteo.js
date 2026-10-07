import { config } from '../config.js';
import { HttpError } from './http-error.js';

// This is the only file that calls fetch or knows Open-Meteo's URLs.
// The exact requests are on the assignment page.

// TODO (you): write a helper that fetches a URL and returns the parsed JSON.
//   - Pass signal: AbortSignal.timeout(config.upstreamTimeoutMs) to fetch.
//   - fetch resolves for every HTTP status, so check res.ok yourself.
//   - Turn every failure into an HttpError: 504 when the timeout fired
//     (err.name is 'TimeoutError'), 502 for a network failure, a status that
//     isn't ok, or a body that isn't JSON.
export async function fetchJson(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(config.upstreamTimeoutMs),
    });

    if (!res.ok) {
      throw new HttpError(res.status, `Upstream returned ${res.status}`);
    }

    try {
      return await res.json();
    } catch {
      throw new HttpError(502, 'Upstream returned invalid JSON');
    }
  } catch (err) {
    if (err instanceof HttpError) {
      throw err;
    } 

    if (err.name === 'TimeoutError') {
      throw new HttpError(504, 'Upstream request timed out');
    }

    throw new HttpError(502, 'Upstream request failed');
  }
}

// TODO (you): look up a city with the geocoding API and return
// { name, region, country, latitude, longitude, timezone } for the first result.
// Throw a 404 HttpError when there are no results.
export async function geocodeCity(name) {
  const url = new URL(`${config.geocodingUrl}/search`);
  url.searchParams.set('name', name);
  url.searchParams.set('count', '1');
  url.searchParams.set('format', 'json');
  url.searchParams.set('language', 'en');

  const data = await fetchJson(url);

  if (!data.results || data.results.length === 0) {
    throw new HttpError(404, `No results for city "${name}"`);
  }

  const [result] = data.results;
  return {
    name: result.name,
    region: result.region,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone
  };
}

// TODO (you): get the current weather and a 3-day daily forecast from the
// forecast API and return the parsed response.
export async function getForecast(latitude, longitude) {
  const url = new URL(`${config.forecastUrl}/forecast`);
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('current','temperature_2m_max,temperature_2m_min,weathercode');
  url.searchParams.set('daily','weathercode,temperature_2m_max,temperature_2m_min');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '3');

  return await fetchJson(url);
}