#!/bin/bash

# Test the AI DJ Announcement Function
# This will generate a test announcement and upload it to AzuraCast

echo "🎙️  Testing AI DJ Announcement Function..."
echo ""

# Get Supabase anon key
echo "📋 Getting Supabase credentials..."
SUPABASE_URL="https://vltamaobaqamxnpkftiq.supabase.co"

# You need to get your anon key from Supabase Dashboard
# Go to: https://supabase.com/dashboard/project/vltamaobaqamxnpkftiq/settings/api
echo ""
echo "⚠️  You need your Supabase ANON key!"
echo "Get it from: https://supabase.com/dashboard/project/vltamaobaqamxnpkftiq/settings/api"
echo ""
read -p "Enter your Supabase ANON key: " SUPABASE_ANON_KEY

if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ No anon key provided. Exiting."
  exit 1
fi

echo ""
echo "🚀 Sending test request..."
echo ""

# Make the request
curl -X POST "${SUPABASE_URL}/functions/v1/ai-dj-announce" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "This is a test announcement from the AI DJ. Testing the new upload functionality!"
  }' \
  --verbose

echo ""
echo ""
echo "✅ Test complete!"
echo ""
echo "📊 Next steps:"
echo "1. Check the output above for any errors"
echo "2. Check Supabase logs: https://supabase.com/dashboard/project/vltamaobaqamxnpkftiq/logs/edge-functions"
echo "3. Check AzuraCast media library: https://a7.asurahosting.com/station/546/files"
echo ""

