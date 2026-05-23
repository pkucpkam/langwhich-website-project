#!/bin/bash

# ======================================================================
#                 LANGWHICH WEBSITE PROJECT - RUN ALL SCRIPT            
# ======================================================================
# This script starts both the Spring Boot Backend and Next.js Frontend
# in the background and terminates them cleanly when you press Ctrl+C.
# ======================================================================

# --- Color Definitions ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}======================================================================${NC}"
echo -e "${YELLOW}                 STARTING LANGWHICH WEBSITE PROJECT                  ${NC}"
echo -e "${YELLOW}======================================================================${NC}"

# --- Prerequisites Check ---

# 1. Check if backend environment file exists
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}[Error] Missing backend/.env file!${NC}"
    echo -e "Please copy backend/.env.example to backend/.env and configure your database."
    exit 1
fi

# 2. Check if frontend environment file exists
if [ ! -f "frontend/.env.local" ]; then
    echo -e "${RED}[Error] Missing frontend/.env.local file!${NC}"
    echo -e "Please copy frontend/.env.local.example to frontend/.env.local."
    exit 1
fi

# 3. Check if frontend node_modules is installed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}[Warning] frontend/node_modules not found.${NC} Installing dependencies..."
    cd frontend && npm install && cd ..
fi

# --- Process Handlers ---

BACKEND_PID=""
FRONTEND_PID=""

# Define cleanup function to terminate background processes on exit
cleanup() {
    echo -e "\n${RED}======================================================================${NC}"
    echo -e "${RED}                 STOPPING APPLICATIONS & CLEANING UP                 ${NC}"
    echo -e "${RED}======================================================================${NC}"
    
    # Terminate backend process
    if [ -n "$BACKEND_PID" ]; then
        echo -e "${BLUE}[Backend]${NC} Stopping Spring Boot backend (PID: $BACKEND_PID)..."
        kill -TERM "$BACKEND_PID" 2>/dev/null
        # Force kill if still running after 2 seconds
        (sleep 2 && kill -9 "$BACKEND_PID" 2>/dev/null) &
    fi
    
    # Terminate frontend process
    if [ -n "$FRONTEND_PID" ]; then
        echo -e "${GREEN}[Frontend]${NC} Stopping Next.js frontend (PID: $FRONTEND_PID)..."
        kill -TERM "$FRONTEND_PID" 2>/dev/null
        # Force kill if still running after 2 seconds
        (sleep 2 && kill -9 "$FRONTEND_PID" 2>/dev/null) &
    fi

    # Also stop Gradle Daemon to free up memory (very important on Windows)
    echo -e "${BLUE}[Backend]${NC} Stopping Gradle Daemon to release RAM..."
    cd backend && ./gradlew --stop &>/dev/null
    cd ..
    
    echo -e "${YELLOW}All processes stopped cleanly. Have a nice day!${NC}"
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# --- Start Backend ---
echo -e "${BLUE}[Backend]${NC} Starting Spring Boot backend on http://localhost:8080..."
cd backend || exit 1
# Ensure Gradle wrapper has execute permission
chmod +x gradlew 2>/dev/null

# Detect OS for specific execution
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    # Running in Git Bash on Windows
    ./gradlew bootRun &
else
    # Running in Unix/Linux/macOS
    ./gradlew bootRun &
fi
BACKEND_PID=$!
cd ..

# --- Start Frontend ---
echo -e "${GREEN}[Frontend]${NC} Starting Next.js frontend on http://localhost:3000..."
cd frontend || exit 1
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${YELLOW}======================================================================${NC}"
echo -e "${GREEN}✓ Frontend is starting at: ${NC}http://localhost:3000"
echo -e "${BLUE}✓ Backend is starting at:  ${NC}http://localhost:8080"
echo -e "${YELLOW}----------------------------------------------------------------------${NC}"
echo -e "${YELLOW}Press [Ctrl+C] at any time to shutdown BOTH servers and free up RAM.${NC}"
echo -e "${YELLOW}======================================================================${NC}\n"

# Wait for background processes to keep script running
wait $BACKEND_PID $FRONTEND_PID
