const express = require('express');
const router = express.Router();
const aiHost = require('../services/aiHost');
const geoLocation = require('../services/geoLocation');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * AI Host Webhook Routes
 * Triggered by AzuraCast or Zapier
 */

/**
 * POST /api/ai-host/announce
 * Generate and return a smart announcement
 * 
 * Body (optional):
 * {
 *   "type": "location|nowplaying|time|random",
 *   "listenerIP": "1.2.3.4"
 * }
 */
router.post('/announce', async (req, res) => {
    try {
        const { type = 'random', listenerIP } = req.body;
        
        console.log(`🎤 AI Host: Generating ${type} announcement...`);
        
        // Get listener location if IP provided
        let location = null;
        if (listenerIP) {
            location = await geoLocation.getLocationFromIP(listenerIP);
            console.log(`📍 Listener from: ${location.city}, ${location.country}`);
        }
        
        // Generate announcement
        const announcement = await aiHost.generateSmartAnnouncement(type);

        console.log(`✅ Generated: "${announcement.text}"`);

        // Upload to AzuraCast
        let uploadResult = null;
        try {
            console.log(`📤 Uploading to AzuraCast...`);

            const formData = new FormData();
            const filename = `ai-dj-live/${path.basename(announcement.audioPath)}`;
            console.log(`   Target path: ${filename}`);

            // IMPORTANT: path must come BEFORE file
            formData.append('path', filename);
            formData.append('file', fs.createReadStream(announcement.audioPath));

            const uploadResponse = await axios.post(
                `${process.env.AZURACAST_BASE_URL}/api/station/${process.env.AZURACAST_STATION_ID}/files/upload`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        'X-API-Key': process.env.AZURACAST_API_KEY
                    }
                }
            );

            uploadResult = uploadResponse.data;
            console.log(`✅ Uploaded to AzuraCast successfully!`);

            // Get the file ID by searching for the uploaded file
            const filesResponse = await axios.get(
                `${process.env.AZURACAST_BASE_URL}/api/station/${process.env.AZURACAST_STATION_ID}/files`,
                {
                    headers: {
                        'X-API-Key': process.env.AZURACAST_API_KEY
                    }
                }
            );

            const uploadedFileName = path.basename(announcement.audioPath);
            const uploadedFile = filesResponse.data.find(f => f.path.includes(uploadedFileName));

            if (uploadedFile) {
                uploadResult.fileId = uploadedFile.id;
                console.log(`   File ID: ${uploadedFile.id}`);
            }

        } catch (uploadError) {
            console.error(`❌ Upload failed:`, uploadError.message);
            if (uploadError.response) {
                console.error(`   Status: ${uploadError.response.status}`);
                console.error(`   Data:`, uploadError.response.data);
            }
            uploadResult = {
                error: uploadError.message,
                details: uploadError.response?.data
            };
        }

        res.json({
            success: true,
            text: announcement.text,
            audioPath: announcement.audioPath,
            location: location,
            uploaded: uploadResult !== null,
            uploadResult: uploadResult
        });
        
    } catch (error) {
        console.error('❌ Error generating announcement:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/ai-host/add-to-playlist
 * Add an uploaded file to a playlist
 *
 * Body:
 * {
 *   "fileId": 11431461,
 *   "playlistId": 5344
 * }
 */
router.post('/add-to-playlist', async (req, res) => {
    try {
        const { fileId, playlistId } = req.body;

        if (!fileId || !playlistId) {
            return res.status(400).json({
                success: false,
                error: 'fileId and playlistId are required'
            });
        }

        console.log(`➕ Adding file ${fileId} to playlist ${playlistId}...`);

        const response = await axios.put(
            `${process.env.AZURACAST_BASE_URL}/api/station/${process.env.AZURACAST_STATION_ID}/file/${fileId}`,
            { playlists: [playlistId] },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': process.env.AZURACAST_API_KEY
                }
            }
        );

        console.log(`✅ File added to playlist successfully!`);

        res.json({
            success: true,
            message: 'File added to playlist',
            data: response.data
        });

    } catch (error) {
        console.error('❌ Error adding file to playlist:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/ai-host/listener-connected
 * Triggered when a new listener connects
 * Decides whether to play a shoutout
 * 
 * Body:
 * {
 *   "ip": "1.2.3.4",
 *   "userAgent": "...",
 *   "timestamp": "2025-12-29T21:00:00Z"
 * }
 */
router.post('/listener-connected', async (req, res) => {
    try {
        const { ip, userAgent, timestamp } = req.body;
        
        console.log(`👤 New listener connected from ${ip}`);
        
        // Should we play an announcement?
        if (!aiHost.shouldPlayAnnouncement()) {
            console.log('⏭️  Skipping announcement (random chance)');
            return res.json({
                success: true,
                playAnnouncement: false,
                reason: 'Random skip to avoid being annoying'
            });
        }
        
        // Get location
        const location = await geoLocation.getLocationFromIP(ip);
        console.log(`📍 Listener from: ${location.city}, ${location.country}`);
        
        // Generate location-based shoutout
        const announcement = await aiHost.generateSmartAnnouncement('location');
        
        console.log(`✅ Generated: "${announcement.text}"`);
        
        res.json({
            success: true,
            playAnnouncement: true,
            text: announcement.text,
            audioPath: announcement.audioPath,
            location: location
        });
        
    } catch (error) {
        console.error('❌ Error handling listener connection:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/ai-host/current-listeners
 * Get current listener locations
 */
router.get('/current-listeners', async (req, res) => {
    try {
        const listeners = await geoLocation.getCurrentListeners();
        const cities = await geoLocation.getListenerCities();
        
        res.json({
            success: true,
            totalListeners: listeners.length,
            cities: cities,
            listeners: listeners
        });
        
    } catch (error) {
        console.error('❌ Error getting listeners:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/ai-host/test
 * Test the AI host with different scenarios
 */
router.post('/test', async (req, res) => {
    try {
        const { type = 'random' } = req.body;
        
        console.log(`🧪 Testing AI Host with type: ${type}`);
        
        const announcement = await aiHost.generateSmartAnnouncement(type);
        
        res.json({
            success: true,
            type: type,
            text: announcement.text,
            audioPath: announcement.audioPath
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

