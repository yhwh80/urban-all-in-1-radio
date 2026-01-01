require('dotenv').config();
const axios = require('axios');

/**
 * IP Geolocation Service
 * Detects listener location from IP address
 */

/**
 * Get location from IP address
 * Uses ipapi.co (free tier: 1,000 requests/day)
 * @param {string} ipAddress - IP address to lookup
 * @returns {Promise<object>} - Location data
 */
async function getLocationFromIP(ipAddress) {
    try {
        // Skip localhost/private IPs
        if (ipAddress === '127.0.0.1' || ipAddress === 'localhost' || ipAddress.startsWith('192.168.')) {
            return {
                city: 'London',
                region: 'England',
                country: 'United Kingdom',
                country_code: 'GB',
                isLocal: true
            };
        }

        const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
        
        return {
            ip: response.data.ip,
            city: response.data.city,
            region: response.data.region,
            country: response.data.country_name,
            country_code: response.data.country_code,
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            timezone: response.data.timezone,
            isLocal: false
        };
    } catch (error) {
        console.error('Error getting location:', error.message);
        // Return default UK location on error
        return {
            city: 'United Kingdom',
            region: 'England',
            country: 'United Kingdom',
            country_code: 'GB',
            error: true
        };
    }
}

/**
 * Get current listeners from AzuraCast
 * @returns {Promise<Array>} - Array of listener objects with locations
 */
async function getCurrentListeners() {
    const AZURACAST_BASE_URL = process.env.AZURACAST_BASE_URL;
    const AZURACAST_API_KEY = process.env.AZURACAST_API_KEY;
    const AZURACAST_STATION_ID = process.env.AZURACAST_STATION_ID;

    if (!AZURACAST_BASE_URL || !AZURACAST_API_KEY || !AZURACAST_STATION_ID) {
        throw new Error('AzuraCast configuration missing in .env');
    }

    try {
        const response = await axios.get(
            `${AZURACAST_BASE_URL}/api/station/${AZURACAST_STATION_ID}/listeners`,
            {
                headers: {
                    'X-API-Key': AZURACAST_API_KEY
                }
            }
        );

        // Get unique locations from listeners
        const listeners = response.data || [];
        const locations = [];

        for (const listener of listeners) {
            if (listener.ip) {
                const location = await getLocationFromIP(listener.ip);
                locations.push({
                    ip: listener.ip,
                    city: location.city,
                    country: location.country,
                    connectedAt: listener.connected_on
                });
            }
        }

        return locations;
    } catch (error) {
        console.error('Error getting listeners:', error.message);
        return [];
    }
}

/**
 * Get unique cities from current listeners
 * @returns {Promise<Array>} - Array of unique city names
 */
async function getListenerCities() {
    const listeners = await getCurrentListeners();
    const cities = [...new Set(listeners.map(l => l.city).filter(Boolean))];
    return cities;
}

/**
 * Generate a natural shoutout based on listener locations
 * @returns {Promise<string>} - Shoutout text
 */
async function generateLocationShoutout() {
    const cities = await getListenerCities();
    
    if (cities.length === 0) {
        return "Big up to everyone listening right now!";
    }
    
    if (cities.length === 1) {
        return `We've got a listener tuning in from ${cities[0]} right now!`;
    }
    
    if (cities.length === 2) {
        return `Shoutout to our listeners in ${cities[0]} and ${cities[1]}!`;
    }
    
    // Multiple cities
    const lastCity = cities.pop();
    const citiesList = cities.join(', ');
    return `Big up to listeners in ${citiesList}, and ${lastCity}!`;
}

module.exports = {
    getLocationFromIP,
    getCurrentListeners,
    getListenerCities,
    generateLocationShoutout
};

