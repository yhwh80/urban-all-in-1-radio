#!/bin/bash

# Test AzuraCast file upload with both ID and shortcode

API_KEY="d32e677c71441ab0:72813a8356bb52b6eae1bf629660c4ee"
BASE_URL="https://a7.asurahosting.com"

echo "🔍 Testing AzuraCast File Upload..."
echo ""

# Create a test MP3 file (silent audio)
echo "📝 Creating test MP3 file..."
TEST_FILE="test-upload.mp3"
# This creates a 1-second silent MP3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame "$TEST_FILE" -y 2>/dev/null

if [ ! -f "$TEST_FILE" ]; then
    echo "❌ Failed to create test file"
    exit 1
fi

echo "✅ Test file created: $TEST_FILE"
echo ""

# Test 1: Upload with numeric ID (546)
echo "🧪 TEST 1: Upload with numeric ID (546)"
echo "URL: $BASE_URL/api/station/546/files/upload"
echo ""

RESPONSE1=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "X-API-Key: $API_KEY" \
  -F "file=@$TEST_FILE" \
  -F "path=$TEST_FILE" \
  "$BASE_URL/api/station/546/files/upload")

HTTP_STATUS1=$(echo "$RESPONSE1" | grep "HTTP_STATUS" | cut -d: -f2)
BODY1=$(echo "$RESPONSE1" | sed '/HTTP_STATUS/d')

echo "Status: $HTTP_STATUS1"
echo "Response: $BODY1"
echo ""

# Test 2: Upload with shortcode
echo "🧪 TEST 2: Upload with shortcode (urban_-_all_in_1_radio)"
echo "URL: $BASE_URL/api/station/urban_-_all_in_1_radio/files/upload"
echo ""

RESPONSE2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "X-API-Key: $API_KEY" \
  -F "file=@$TEST_FILE" \
  -F "path=$TEST_FILE" \
  "$BASE_URL/api/station/urban_-_all_in_1_radio/files/upload")

HTTP_STATUS2=$(echo "$RESPONSE2" | grep "HTTP_STATUS" | cut -d: -f2)
BODY2=$(echo "$RESPONSE2" | sed '/HTTP_STATUS/d')

echo "Status: $HTTP_STATUS2"
echo "Response: $BODY2"
echo ""

# Test 3: Try without path parameter
echo "🧪 TEST 3: Upload with ID, no path parameter"
echo ""

RESPONSE3=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "X-API-Key: $API_KEY" \
  -F "file=@$TEST_FILE" \
  "$BASE_URL/api/station/546/files/upload")

HTTP_STATUS3=$(echo "$RESPONSE3" | grep "HTTP_STATUS" | cut -d: -f2)
BODY3=$(echo "$RESPONSE3" | sed '/HTTP_STATUS/d')

echo "Status: $HTTP_STATUS3"
echo "Response: $BODY3"
echo ""

# Cleanup
rm -f "$TEST_FILE"

echo "🏁 Tests complete!"
echo ""
echo "Summary:"
echo "  Test 1 (ID 546 with path):     HTTP $HTTP_STATUS1"
echo "  Test 2 (shortcode with path):  HTTP $HTTP_STATUS2"
echo "  Test 3 (ID 546 no path):       HTTP $HTTP_STATUS3"

