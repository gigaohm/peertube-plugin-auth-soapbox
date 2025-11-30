#!/bin/bash

# Local PeerTube Testing Script

set -e

echo "🐳 Starting local PeerTube instance for plugin testing..."

# Change to local-test directory
cd local-test

# Start PeerTube with Docker Compose
echo "Starting PeerTube services..."
docker-compose up -d

echo "⏳ Waiting for PeerTube to initialize..."
sleep 30

# Check if PeerTube is running
echo "🔍 Checking PeerTube status..."
if curl -s http://localhost:9000/api/v1/config > /dev/null; then
    echo "✅ PeerTube is running at http://localhost:9000"
    echo "📊 Admin panel: http://localhost:9000/admin"
    echo ""
    echo "🔧 To install our plugin:"
    echo "   docker-compose exec peertube peertube-cli plugins install --path /app/plugins/peertube-plugin-auth-soapbox"
    echo ""
    echo "🛑 To stop PeerTube:"
    echo "   docker-compose down"
else
    echo "❌ PeerTube failed to start. Check logs with:"
    echo "   docker-compose logs peertube"
fi
