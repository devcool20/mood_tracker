# Mood Tracker Mobile App

A React Native Expo app for tracking daily moods with AI-generated insights.

## Features

- **Mood Logging**: Select mood from dropdown, add text notes, and optional voice notes
- **Mood History**: View all past mood entries in a scrollable list
- **AI Insights**: Tap any mood entry to get AI-generated insights using Gemini
- **Voice Notes**: Record or select audio files to accompany mood entries

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your phone (iOS/Android)

### Installation

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device:**
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal
   - The app will load on your device

### Backend Connection

Make sure your Flask backend is running on `http://localhost:5000` before using the app.

**For physical device testing:**
- Update `API_BASE_URL` in `src/services/api.js` to your computer's IP address
- Example: `http://192.168.1.100:5000`

## App Structure

```
mobile/
├── App.js                 # Main app component with navigation
├── src/
│   ├── screens/
│   │   ├── MoodLoggingScreen.js    # Screen for logging new moods
│   │   └── MoodHistoryScreen.js    # Screen for viewing mood history
│   └── services/
│       └── api.js                  # API service for backend communication
└── package.json
```

## Usage

1. **Log Mood**: Select mood, add optional text/voice note, tap "Log Mood"
2. **View History**: See all past mood entries with dates and notes
3. **Get Insights**: Tap any mood entry to view AI-generated insights
4. **Voice Notes**: Use the voice button to record or select audio files

## Testing

The app includes basic error handling and loading states. Test with:
- Different mood selections
- Text notes of various lengths
- Voice note uploads (if supported on device)
- Network connectivity issues

## Troubleshooting

- **Connection issues**: Ensure backend is running and accessible
- **Voice notes**: Some devices may have limitations with audio recording
- **Build errors**: Try clearing cache with `expo start -c`
