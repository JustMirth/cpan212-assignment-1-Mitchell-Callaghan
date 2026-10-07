import { config } from '../config.js';

// TODO (you): an in-memory cache where each entry expires after a set time.
// It needs a way to get a value (counting a hit or a miss), store a value,
// and report { entries, hits, misses, ttlSeconds }. The exact counting rules
// are on the assignment page. A Map with { value, expiresAt } entries works well.

const cache = new Map();

let hits = 0;
let misses = 0;

export function get(key) {
    const entry = cache.get(key);

    if (!entry) {
        misses++;
        return undefined;
    }

    if (Date.now() >= entry.expiresAt) {
        cache.delete(key);
        misses++;
        return undefined;
    }

    hits++;
    return entry.value;
}

export function set(key, value) {
    cache.set(key, {
        value,
        expiresAt: Date.now() + config.cacheTtlSeconds * 1000,
    });
}

export function getStats() {
    const now = Date.now();
    
    for (const [key, entry] of cache.entries()) {
        if (now >= entry.expiresAt) {
            cache.delete(key);
        }
    }

    return {
        entries: cache.size,
        hits,
        misses,
        ttlSeconds: config.cacheTtlSeconds,
    };
}