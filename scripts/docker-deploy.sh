#!/bin/bash

# Docker Deploy Script for Turborepo Monorepo
# This script deploys all services using Docker Compose

set -e

echo "🚀 Starting Docker deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Parse command line arguments
ENVIRONMENT=${1:-production}
ACTION=${2:-up}

if [ "$ENVIRONMENT" = "development" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    print_status "Deploying for development environment"
else
    COMPOSE_FILE="docker-compose.yml"
    print_status "Deploying for production environment"
fi

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Docker compose file $COMPOSE_FILE not found"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

case $ACTION in
    "up")
        print_step "Starting all services..."
        docker-compose -f $COMPOSE_FILE up -d
        
        if [ $? -eq 0 ]; then
            print_status "✅ All services started successfully!"
            print_status "Services are running on:"
            echo "  🌐 Web App: http://localhost:3000"
            echo "  🔧 Backend API: http://localhost:4000"
            echo "  🗄️  PostgreSQL: localhost:5432"
            echo ""
            print_status "To view logs, run:"
            echo "  docker-compose -f $COMPOSE_FILE logs -f"
        else
            print_error "❌ Failed to start services!"
            exit 1
        fi
        ;;
    "down")
        print_step "Stopping all services..."
        docker-compose -f $COMPOSE_FILE down
        
        if [ $? -eq 0 ]; then
            print_status "✅ All services stopped successfully!"
        else
            print_error "❌ Failed to stop services!"
            exit 1
        fi
        ;;
    "restart")
        print_step "Restarting all services..."
        docker-compose -f $COMPOSE_FILE restart
        
        if [ $? -eq 0 ]; then
            print_status "✅ All services restarted successfully!"
        else
            print_error "❌ Failed to restart services!"
            exit 1
        fi
        ;;
    "logs")
        print_step "Showing logs for all services..."
        docker-compose -f $COMPOSE_FILE logs -f
        ;;
    "status")
        print_step "Checking service status..."
        docker-compose -f $COMPOSE_FILE ps
        ;;
    *)
        print_error "Unknown action: $ACTION"
        echo "Usage: $0 [environment] [action]"
        echo "Environments: production, development"
        echo "Actions: up, down, restart, logs, status"
        exit 1
        ;;
esac
