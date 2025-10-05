#!/bin/bash

# Setup Script for Turborepo Monorepo with Docker
# This script sets up the development environment

set -e

echo "🚀 Setting up Turborepo Monorepo with Docker..."

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

# Check if required tools are installed
check_requirements() {
    print_step "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm is not installed. Installing pnpm..."
        npm install -g pnpm
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi
    
    # Check docker-compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed. Please install docker-compose and try again."
        exit 1
    fi
    
    print_status "✅ All requirements are satisfied!"
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    pnpm install
    print_status "✅ Dependencies installed!"
}

# Make scripts executable
make_scripts_executable() {
    print_step "Making scripts executable..."
    chmod +x scripts/*.sh
    print_status "✅ Scripts are now executable!"
}

# Create environment files
create_env_files() {
    print_step "Creating environment files..."
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydevelops

# Backend
NODE_ENV=development
PORT=4000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF
        print_status "✅ Created .env file"
    else
        print_warning ".env file already exists, skipping..."
    fi
    
    # Create .env.example file
    if [ ! -f ".env.example" ]; then
        cat > .env.example << EOF
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydevelops

# Backend
NODE_ENV=development
PORT=4000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF
        print_status "✅ Created .env.example file"
    fi
}

# Main setup function
main() {
    print_status "Starting setup process..."
    
    check_requirements
    install_dependencies
    make_scripts_executable
    create_env_files
    
    print_status "🎉 Setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "  1. Run './scripts/docker-build.sh development' to build for development"
    echo "  2. Run './scripts/docker-deploy.sh development up' to start development services"
    echo "  3. Or run './scripts/docker-deploy.sh production up' for production"
    echo ""
    print_status "Available commands:"
    echo "  ./scripts/docker-build.sh [development|production] [--no-cache]"
    echo "  ./scripts/docker-deploy.sh [development|production] [up|down|restart|logs|status]"
}

# Run main function
main
