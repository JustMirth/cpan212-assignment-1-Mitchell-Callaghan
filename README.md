# City Weather API

This service is used to check weather for different cities around the world using Open-Mateo API. With it, you will be able to see a 3 day forecast for the cities, compare the temperature in the cities, and keep successfully searched cities info in a cache.

## Run it

npm install

cp .env.example .env

npm run dev

Server will run on port 4000 by default.

## Environment variables

All of the following will be formatted the same (Variable Name / Default for Variable / What It Controls)

PORT // 4000 // The port the server listens on

GEOCODING_URL // https://geocoding-api.open-meteo.com/v1 // The base URL used for city geocoding

FORECAST_URL // https://api.open-meteo.com/v1 // The base URL used for weather forecasts

UPSTREAM_TIMEOUT_MS // 5000 // How long to wait for an Open-Meteo request before timing out

CACHE_TTL_SECONDS // 600 //How long a cached weather result remains valid

## Endpoints

### Get weather for a city

GET /api/weather?city=Toronto

Returns the city's location, current weather, a 3-day forecast, the time the data was fetched, and whether the result came from the cache.

Example:

curl "http://localhost:4000/api/weather?city=Toronto"

### Compare multiple cities

GET /api/compare?cities=Toronto,Vancouver,Halifax

Accepts between 2 and 5 cities. The response contains a result for each requested city, including failed lookups, along with the number of successful and failed cities and the warmest and coldest successful cities.

Example:

curl "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax"

### Cache statistics

GET /api/cache/stats

Returns the number of active cached entries, cache hits, cache misses, and the configured cache TTL.

Example:

curl "http://localhost:4000/api/cache/stats"

## Data source

All weather and geocoding data is provided by Open-Meteo. (Link: https://open-meteo.com/)


## Testing

Start the server with:

npm run dev

Then, in a second Git Bash terminal, run these requests in order. The expected status codes assume the server has just been started and the cache is empty.

### 1. Weather for a city — 200

curl -i "http://localhost:4000/api/weather?city=Toronto"

### 2. Same city again (cached) — 200

curl -i "http://localhost:4000/api/weather?city=Toronto"

The second request should use the cached result and return "cached": true.

### 3. Weather without a city — 400

curl -i "http://localhost:4000/api/weather"

### 4. Weather for a city that doesn't exist — 404

curl -i "http://localhost:4000/api/weather?city=Qwertyville"

### 5. Compare three cities — 200

curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax"

### 6. Compare with one city that doesn't exist — 200

curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Qwertyville"

The overall request is still 200. The nonexistent city should have "ok": false with a 404 error inside its result.

### 7. Compare too many cities — 400

curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax,Ottawa,Montreal,Calgary"

### 8. Compare with a repeated city — 400

curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,toronto"

### 9. Cache statistics — 200

curl -i "http://localhost:4000/api/cache/stats"

### 10. Unknown route — 404

curl -i "http://localhost:4000/api/not-a-route"

## AI use

Used Github Co-Pilot to auto-complete error formatting in open-mateo.js

Used ChatGPT to fix mismatched names (actually find them), when working the cache routes/feature into the already weather retriving functions.
