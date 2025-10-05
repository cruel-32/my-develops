#!/bin/bash

# Docker Build Script for Turborepo Monorepo
# This script builds all services using Docker Compose

set -e

echo "🚀 Starting Docker build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Parse command line arguments
ENVIRONMENT=${1:-production}
BUILD_ARGS=""

if [ "$ENVIRONMENT" = "development" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    print_status "Building for development environment"
else
    COMPOSE_FILE="docker-compose.yml"
    print_status "Building for production environment"
fi

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Docker compose file $COMPOSE_FILE not found"
    exit 1
fi

# Build all services
print_status "Building all services with $COMPOSE_FILE..."

# Build without cache for fresh builds
if [ "$2" = "--no-cache" ]; then
    print_warning "Building without cache..."
    docker-compose -f $COMPOSE_FILE build --no-cache
else
    docker-compose -f $COMPOSE_FILE build
fi

if [ $? -eq 0 ]; then
    print_status "✅ All services built successfully!"
    print_status "To start the services, run:"
    echo "  docker-compose -f $COMPOSE_FILE up -d"
    echo ""
    print_status "To view logs, run:"
    echo "  docker-compose -f $COMPOSE_FILE logs -f"
else
    print_error "❌ Build failed!"
    exit 1
fi
