
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Betmate is a web platform that combines chess with live betting functionality. The application allows users to place wagers on 
game outcomes and specific moves throughout a chess match using virtual currency. Live games are sourced from Lichess, a popular 
chess platform.

## Repository Structure

The project consists of three main components, each in its own separate repository:

1. **Backend**: TypeScript/Node.js Express server with MongoDB database 2. **Frontend**: TypeScript/React with Redux-Saga for 
state management 3. **Microservice**: Python application with Stockfish chess engine integration

## Development Commands

### Backend

```bash
# Install dependencies
cd backend yarn install

# Start development server
yarn dev

# Run tests
yarn test

# Run linting
yarn lint

# Build for production
yarn build

# Start production server
yarn prod ```

### Frontend

```bash
# Install dependencies
cd frontend yarn install

# Start development server
yarn dev

# Run linting tests
yarn test

# Build for development environment
yarn build-dev

# Build for production environment
yarn build-prod ```

### Microservice

```bash
# Setup Python environment
cd microservice python -m venv ./venv source ./venv/bin/activate pip install -r requirements.txt

# Run tests
pytest

# Run linting
bash lint.sh

# Run with Docker (emulates AWS Lambda locally)
docker-compose build docker-compose up ```

## Environment Setup

### Backend Environment Variables
The backend requires a `.env` file with the following variables: - `AUTH_SECRET`: Any string for JWT token generation - 
`MONGODB_URI`: MongoDB connection string (format: "mongodb://localhost:27017/<dbname>") - `MICROSERVICE_API_KEY`: API key for 
accessing the microservice

## Architecture

### Backend

- **Server**: TypeScript/Node.js with Express - **Database**: MongoDB with Mongoose ORM - **Authentication**: Passport.js with 
JWT - **Real-time Updates**: Socket.IO - **Chess Logic**: chess.js library

Key directories: - `src/controllers/`: Handle business logic for API endpoints - `src/models/`: MongoDB schemas and models - 
`src/routers/`: API route definitions - `src/services/`: Database and microservice interaction - `src/websockets/`: Socket.IO 
event handlers - `src/helpers/`: Utility functions and constants

### Frontend

- **Framework**: React with TypeScript - **State Management**: Redux with Redux-Saga - **Routing**: React Router - **API 
Communication**: Axios - **Real-time Updates**: Socket.IO client - **Chess UI**: Chessground and chess.js

Key directories: - `src/components/`: Reusable UI components - `src/containers/`: Page components - `src/store/`: Redux store, 
reducers, actions, and sagas - `src/utils/`: Utility functions

### Microservice

- **Language**: Python 3.8 - **Chess Logic**: python-chess library - **Chess Engine**: Stockfish - **Containerization**: Docker 
- **Deployment**: AWS Lambda

Key functionality: - Calculate win/draw/loss probabilities based on board state - Identify the best moves for a given position

## Development Flow

1. Backend and Microservice provide API endpoints for chess analysis and wager management 2. Frontend displays the chess UI and 
wager interface 3. WebSockets provide real-time updates for game progress and wager status

## Testing

- **Backend**: Jest with MongoDB memory server for database testing - **Frontend**: ESLint for code quality testing - 
**Microservice**: Pytest for Python testing

## Deployment

The project is set up for continuous deployment:

- **Backend**: Deployed on Heroku - **Frontend**: Deployed on Netlify
  - Development branch deploys to https://betmate-dev.netlify.app/ - Release branch deploys to https://betmate-prod.netlify.app/
- **Microservice**: Deployed on AWS Lambda

## Git workflow  (IMPORTANT – monorepo has three separate Git projects)
1. From project root:
   - `cd frontend`  ➜  `git checkout -b feature/new-game-layout`
   - `cd ../backend` ➜ `git checkout -b feature/new-game-layout`
   - `cd ../microservice` ➜ `git checkout -b feature/new-game-layout`
   (Each directory is its own repo; **do NOT run `git init` at the monorepo root.**)

2. Work only inside the branch `feature/new-game-layout` in each repo while implementing the tasks below.

3. When finished:
   - Commit in each repo: `git add . && git commit -m "feat: new dark game layout"`
   - Push: `git push -u origin feature/new-game-layout`

4. Open three PRs named **“New dark game layout”** targeting `main` for _frontend_, _backend_, and _microservice_ respectively.

