import { HttpError } from '../lib/http-error.js';

// TODO (you): check ?city= and return the trimmed city name. Throw a 400
// HttpError with details.city when it breaks a rule from the assignment page.
export function parseCity(value) {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'Invalid query', { city: 'City is required' });
  }

  const city = value.trim();

  if (city.length === 0) {
    throw new HttpError(400, 'Invalid query', { city: 'City is required' });
  }

  if (city.length < 2 || city.length > 60) {
    throw new HttpError(400, 'Invalid query', { city: 'City must be between 2 and 60 characters' });
  }

return city;
}

// TODO (you): check ?cities= and return an array of trimmed city names. Throw a
// 400 HttpError with details.cities when it breaks a rule from the assignment page.
export function parseCities(value) {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'Invalid query', { cities: 'Cities is required' });
  }

  if (value.trim().length === 0) {
    throw new HttpError(400, 'Invalid query', { cities: 'Cities is required' });
  }

  const cities = value.split(',').map((city) => city.trim());

  if (cities.some((city) => city.length === 0)) {
    throw new HttpError(400, 'Invalid query', { cities: 'Cities must not be empty' });
  }

  if (cities.length < 2 || cities.length > 5) {
    throw new HttpError(400, 'Invalid query', { cities: 'Must specify between 2 and 5 cities' });
  }

  for (const city of cities) {
    if (city.length < 2 || city.length > 60) {
      throw new HttpError(400, 'Invalid query', { cities: 'Each city must be between 2 and 60 characters' });
    }
  }

  const seen = new Set();

  for (const city of cities) {
    const key = city.toLowerCase();
    if (seen.has(key)) {
      throw new HttpError(400, 'Invalid query', { cities: 'Cities must be unique' });
    }
    seen.add(key);
  }

  return cities;
}