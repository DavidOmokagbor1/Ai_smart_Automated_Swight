# AI Smart Automated Light Control System

[![CI](https://github.com/DavidOmokagbor1/Ai_smart_Automated_Swight/actions/workflows/ci.yml/badge.svg)](https://github.com/DavidOmokagbor1/Ai_smart_Automated_Swight/actions/workflows/ci.yml)

An AI-powered smart lighting system that reduces energy consumption by **30-50%** using machine learning, real-time optimization, and weather integration.

## Built With

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-499848?style=for-the-badge&logo=gunicorn&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=000)
![Datadog](https://img.shields.io/badge/Datadog-632CA6?style=for-the-badge&logo=datadog&logoColor=white)
![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-EE6A4C?style=for-the-badge&logo=openweathermap&logoColor=white)
![MonitorUptime Robot](https://img.shields.io/badge/MonitorUptime_Robot-00C853?style=for-the-badge&logo=uptimerobot&logoColor=white)



https://github.com/user-attachments/assets/d24eae7b-8baa-4562-8931-e877ad16b833




## Key Features

- **AI-Powered Predictions**: 85-96% accuracy occupancy prediction using Random Forest
- **Real-time Control**: WebSocket-based live updates across web and mobile
- **Weather Integration**: Automatic brightness adjustment based on weather conditions
- **Energy Analytics**: Real-time monitoring with 30-50% energy reduction
- **Cross-Platform**: Web (React) and Mobile (React Native/Expo) applications
- **Production Ready**: Deployed on Vercel (frontend) and Render (backend)

## Results

- **Energy Reduction**: 30-50%
- **Cost Savings**: $150+ per month
- **AI Accuracy**: 85-96%
- **CO₂ Reduction**: ~45 kg/month

## Live Demo

- **Web App**: [ai-smart-automated-swight.vercel.app](https://ai-smart-automated-swight.vercel.app)
- **API**: [ai-smart-automated-swight.onrender.com](https://ai-smart-automated-swight.onrender.com)

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Installation

```bash
# Clone repository
git clone https://github.com/DavidOmokagbor1/Ai_smart_Automated_Swight.git
cd Ai_smart_Automated_Swight

# Backend setup
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration (never commit .env)

# Frontend setup
cd ../frontend
cp .env.example .env.local
npm install

# Run
python app.py  # Backend on :5000
npm start      # Frontend on :3000
```

### Tests

```bash
cd backend
pytest
```

`backend/test_datadog.py` is a manual live-server smoke script and is not part of the default pytest suite.

## Tech Stack

**Frontend**: React 18, Tailwind CSS, Socket.IO Client, Recharts  
**Backend**: Flask, Flask-SocketIO, sqlite3, Scikit-learn  
**Mobile**: React Native, Expo  
**Deployment**: Vercel, Render  
**Monitoring**: Datadog, MonitorUptime Robot  
**APIs**: OpenWeatherMap

## Project Structure

```
├── backend/     # Flask API + ML models
├── frontend/    # React web app
├── mobile/      # React Native app
└── docs/        # Documentation
```

## Documentation

- [System Overview](docs/SYSTEM_OVERVIEW.md)
- [Weather API Setup](docs/WEATHER_API_SETUP.md)
- [Datadog Setup](docs/DATADOG_SETUP.md)
- [Security Guide](docs/SECURITY.md)
- [Deployment Guide](VERCEL_DEPLOYMENT.md)

## License

MIT License — see [LICENSE](LICENSE)

## Author

**David Omokagbor**  
GitHub: [@DavidOmokagbor1](https://github.com/DavidOmokagbor1)
