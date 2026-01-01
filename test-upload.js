const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testUpload() {
    const formData = new FormData();

    // Use the exact same file from curl test
    const filePath = 'output/voice/ai-host-1767043804770.mp3';

    // IMPORTANT: path must come BEFORE file (same order as curl)
    formData.append('path', 'ai-dj-live/test-upload.mp3');
    formData.append('file', fs.createReadStream(filePath));
    
    try {
        const response = await axios.post(
            'https://a7.asurahosting.com/api/station/546/files/upload',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'X-API-Key': 'd32e677c71441ab0:72813a8356bb52b6eae1bf629660c4ee'
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );
        
        console.log('✅ SUCCESS!');
        console.log(response.data);
    } catch (error) {
        console.error('❌ FAILED:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testUpload();

