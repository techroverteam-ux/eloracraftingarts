#!/bin/bash

echo "🚀 Starting Elora Art - Complete System"
echo "======================================="

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*3001" 2>/dev/null || true
pkill -f "next.*3000" 2>/dev/null || true  
pkill -f "next.*3002" 2>/dev/null || true
sleep 2

echo ""
echo "🎯 Starting all services..."
echo ""

# Start API server
echo "🔧 Starting API Server (Port 3001)..."
cd api && npm start > ../api.log 2>&1 &
API_PID=$!
cd ..

# Wait for API to start
sleep 3

# Start Web Portal
echo "🌐 Starting Web Portal (Port 3000)..."
cd web-portal && npm run dev > ../web.log 2>&1 &
WEB_PID=$!
cd ..

# Start Admin Portal  
echo "⚙️  Starting Admin Portal (Port 3002)..."
cd admin-portal && npm run dev > ../admin.log 2>&1 &
ADMIN_PID=$!
cd ..

# Wait for services to start
sleep 8

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🔗 Access your applications:"
echo "   📊 API Server:      http://localhost:3001"
echo "   📚 API Docs:        http://localhost:3001/api/docs"
echo "   🌐 Web Portal:      http://localhost:3000 (Client Interface)"
echo "   ⚙️  Admin Portal:    http://localhost:3002 (Management Interface)"
echo ""
echo "👤 Demo Login Credentials:"
echo "   Email:    admin@eloraart.com"
echo "   Password: admin123"
echo ""
echo "📋 Features Available:"
echo "   • Complete order management with pagination"
echo "   • User management with role-based access"
echo "   • Real-time analytics and statistics"
echo "   • Responsive design with unique UI"
echo "   • API documentation with Swagger"
echo ""
echo "🛑 To stop all services: Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $API_PID $WEB_PID $ADMIN_PID 2>/dev/null
    pkill -f "node.*3001" 2>/dev/null || true
    pkill -f "next.*3000" 2>/dev/null || true  
    pkill -f "next.*3002" 2>/dev/null || true
    echo "✅ All services stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Keep script running and show logs
echo "🔄 Services running... Press Ctrl+C to stop all services"
echo "📝 Logs are being written to api.log, web.log, and admin.log"
echo ""

# Show real-time status
while true; do
    sleep 10
    echo "⏰ $(date '+%H:%M:%S') - Services running..."
done