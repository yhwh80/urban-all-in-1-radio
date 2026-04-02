#!/bin/bash
# Start all AI DJ services
# Run this to have everything automated with n8n

cd "$(dirname "$0")"

echo "=========================================="
echo "🎙️  AI DJ SYSTEM STARTUP"
echo "=========================================="

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "   Run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate venv
source venv/bin/activate

# Check dependencies
python -c "import requests, dotenv" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Missing dependencies!"
    echo "   Run: pip install requests python-dotenv"
    exit 1
fi

echo ""
echo "Starting services..."
echo ""

# Start DJ Server in background
echo "1️⃣  Starting DJ Server on port 3001..."
python dj_server.py &
DJ_PID=$!
echo "   PID: $DJ_PID"

# Give server time to start
sleep 2

# Test if server is running
curl -s http://localhost:3001/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ DJ Server running!"
else
    echo "   ⚠️  DJ Server may not have started properly"
fi

echo ""
echo "=========================================="
echo "✅ AI DJ SYSTEM READY"
echo "=========================================="
echo ""
echo "Services running:"
echo "  • DJ Server: http://localhost:3001"
echo "    - Health:  GET /health"
echo "    - Trigger: GET /trigger?type=auto&intro=false"
echo ""
echo "Next steps:"
echo "  1. Start Liquidsoap mixer (if using voice ducking):"
echo "     cd ../liquidsoap-mixer && ./start-mixer.sh"
echo ""
echo "  2. Import n8n workflow:"
echo "     File: ../n8n-workflows/smart-ai-dj-v3-llm.json"
echo "     This polls AzuraCast and triggers DJ automatically"
echo ""
echo "  3. OR run track monitor (alternative to n8n):"
echo "     python track_monitor.py"
echo ""
echo "Manual trigger:"
echo "  ./dj.sh              # Auto announcement"
echo "  ./dj.sh next_song    # Announce next song"
echo "  ./dj.sh weather      # Weather update"
echo "  ./dj.sh news         # Music news"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '👋 Stopping services...'; kill $DJ_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Keep script running
wait $DJ_PID
