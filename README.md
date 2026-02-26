# 📱 AI-Based Mobile Advisor

An intelligent, real-time mobile recommendation system that helps users find their perfect smartphone based on precision-weighted algorithms and live market data.

## 🚀 Overview
The **AI-Based Mobile Advisor** is a Flask-powered web application that bridge the gap between complex tech specs and user needs. It features a sophisticated `RecommendationEngine` that uses non-linear scoring to provide highly accurate matches across diverse budget ranges and performance requirements.

## ✨ Key Features
- **🎯 Precision Recommendation Engine**: Uses ultra-granular weights (Price, RAM, Camera, Display, Chipset, etc.) with non-linear penalty for over-budget options.
- **📈 Advanced Scoring**:
    - **Match Percentage**: Precision matching based on user preferences.
    - **Value Score**: A custom metric calculating "Performance per Dollar" to find true budget gems.
- **🌍 Real-Time Market Integration**:
    - Live USD to INR currency conversion using external APIs.
    - Regional pricing simulation (adjusting for local taxes and import duties).
- **📱 Smart Categorization**: Provides "Best Matches," "Similar Phones," "Value Picks," and "Budget Alternatives."
- **⚡ Modern Tech Stack**: Python (Flask), Vanilla JS, and a curated database of 50+ cutting-edge mobile devices.

## 🛠️ Technical Architecture
### Core Components
- **`app.py`**: The central Flask server handling routing and API endpoints.
- **`recommendation_engine.py`**: The "brain" of the system, implementing the weighted scoring logic.
- **`api_client.py`**: Manages the mobile database and external API integrations for currency data.
- **`static/js/main.js`**: Handles the dynamic frontend interactions and recommendation rendering.

## 💻 Installation & Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/ai-mobile-advisor.git
   cd ai-mobile-advisor
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python app.py
   ```
   The app will be available at `http://localhost:5001`.

## 📁 Project Structure
```text
AI-Based Mobile Advisor/
├── app.py                # Flask Application Entry
├── api_client.py         # Data & API Management
├── recommendation_engine.py # AI Scoring Logic
├── requirements.txt      # Project Dependencies
├── static/               # CSS, JS, and Assets
└── templates/            # HTML Templates
```

---
*Built with precision for the modern mobile consumer.*
