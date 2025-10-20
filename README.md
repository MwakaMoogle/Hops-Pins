# Hops & Pins 🍻

A social pub-tracking mobile app built with React Native and Expo. Discover, log, and share your pub experiences with friends.

## Features

- 🗺️ Interactive map with pub locations
- 📝 Log visits and rate drinks
- 👥 Social sharing with friends
- ⭐ Personal visit history and statistics
- 🔍 Search and discover new pubs

## Tech Stack

- **Frontend:** React Native + Expo
- **Navigation:** React Navigation
- **Backend:** Firebase (Firestore & Auth)
- **Maps:** React Native Maps + Mapbox
- **State Management:** React Context API

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) / Android Studio (Windows/Linux)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hops-and-pins.git
   cd hops-and-pins
   ```

2. **Install dependencies**
  ```bash
  npm install
  # or
  yarn install
  ```

3. **Environment Setup**
- Copy .env.example to .env
- Add your API keys:
  ```text
  EXPO_PUBLIC_FIREBASE_API_KEY=your_key
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
  EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token
  ```

4. Start the development server
  ```bash
  npx expo start
  ```
