const fs = require('fs');
const { Blob } = require('buffer');

async function testUpload() {
    const filePath = 'output/voice/ai-host-1767043804770.mp3';
    
    // Read file as buffer
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'audio/mpeg' });
    
    // Create FormData
    const formData = new FormData();
    formData.append('path', 'ai-dj-live/test-upload.mp3');
    formData.append('file', blob, 'test-upload.mp3');
    
    try {
        const response = await fetch('https://a7.asurahosting.com/api/station/546/files', {
            method: 'POST',
            headers: {
                'X-API-Key': 'd32e677c71441ab0:72813a8356bb52b6eae1bf629660c4ee'
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ SUCCESS!');
            console.log(data);
        } else {
            console.error('❌ FAILED:', response.status);
            console.error(data);
        }
    } catch (error) {
        console.error('❌ ERROR:', error.message);
    }
}

testUpload();

