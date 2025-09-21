# Mood Tracker App 🎭

A full-stack mobile application for tracking daily moods with voice notes and AI-generated insights. Built with React Native (Expo) for the frontend and Flask + MongoDB for the backend.

## Features 🌟

- Log daily moods with text notes and voice recordings
- Record voice notes (10-30 seconds)
- View mood history with timestamps
- AI-generated insights for each mood entry using Google's Gemini API
- Voice note playback in mood history
- Tag-based mood analysis
- Delete unwanted mood entries

## Tech Stack 💻

### Frontend
- React Native (Expo)
- React Navigation
- Expo AV (for audio recording/playback)

### Backend
- Flask (Python)
- MongoDB
- Google Gemini API (for AI insights)

## Prerequisites 📋

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- Python 3.8+
- MongoDB
- Expo CLI (`npm install -g expo-cli`)
- Google Gemini API key

## Setup Instructions 🚀

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mood-tracker
```

### 2. Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/mood_tracker
GEMINI_API_KEY=your_gemini_api_key_here
```

5. Create voice notes directory:
```bash
mkdir voice_notes
```

6. Start the backend server:
```bash
python app.py
```
The server will start on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL:
- Open `src/services/api.js`
- Replace `API_BASE_URL` with your computer's IP address:
```javascript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000';
```
To find your IP address:
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

4. Start the Expo development server:
```bash
npx expo start
```

### 4. MongoDB Setup

1. Install MongoDB Community Edition from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

2. Start MongoDB service:
```bash
# Windows (if not running as service)
mongod

# macOS/Linux
sudo service mongod start
```

3. The database will be created automatically when you first run the backend.

## Using the App 📱

1. **Start Recording Moods**
   - Open the app
   - Click "Log New Mood"
   - Select your mood from the dropdown
   - Add a text note (optional)
   - Record a voice note (optional, 10-30 seconds)
   - Click "Log Mood"

2. **View Mood History**
   - Click "View Mood History"
   - See all your logged moods with timestamps
   - Click on any mood to view details
   - Listen to voice notes if recorded
   - Read AI-generated insights
   - View detected tags and patterns

3. **Managing Entries**
   - Delete unwanted entries using the trash icon
   - Play/pause voice notes
   - View AI insights for better self-understanding

## Troubleshooting 🔧

1. **Backend Connection Issues**
   - Ensure MongoDB is running
   - Check if the backend server is running on port 5000
   - Verify your IP address in `api.js` is correct
   - Check if your device and computer are on the same network

2. **Voice Recording Issues**
   - Grant microphone permissions when prompted
   - Ensure you're not exceeding the 30-second limit
   - Check if device storage has enough space

3. **AI Insights Not Showing**
   - Verify your Gemini API key in `.env`
   - Check backend logs for API errors
   - Ensure text notes are provided for AI analysis

## Development Notes 📝

- The app uses Expo's managed workflow
- Voice notes are stored in the backend's `voice_notes` directory
- AI insights are generated once when logging moods and stored in the database
- The frontend communicates with the backend via RESTful APIs
- All dates are stored in ISO format with timezone information

## API Endpoints 🔌

- `POST /mood-log` - Log a new mood
- `GET /mood-history` - Get all mood entries
- `DELETE /mood/:id` - Delete a mood entry
- `POST /upload-voice` - Upload voice note
- `GET /voice/:filename` - Serve voice note file



