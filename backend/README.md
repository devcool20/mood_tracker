# Mood Tracker Backend

This is the backend service for the Mood Tracker application, built with Flask and MongoDB.

## Setup Instructions

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your:
     - MongoDB connection string
     - OpenAI API key
     - Secret key for JWT

4. Make sure MongoDB is running locally or update the MONGODB_URI in .env

5. Run the application:
   ```bash
   python app.py
   ```

The server will start at http://localhost:5000

## API Endpoints

### POST /upload-voice
Upload a voice note file

Request: Multipart form data with `voice_note` file
- Supported formats: wav, mp3, m4a, aac, ogg
- Max file size: 10MB

Response:
```json
{
    "message": "Voice note uploaded successfully",
    "filename": "unique-filename.wav",
    "url": "/voice/unique-filename.wav"
}
```

### GET /voice/:filename
Serve a voice note file

### POST /mood-log
Log a new mood entry

Request body:
```json
{
    "mood": "Happy",
    "date": "2025-09-20T10:00:00",
    "text_note": "Had a great day at work!",
    "voice_note_filename": "optional_filename_from_upload"
}
```

### GET /mood-history
Get all mood entries, sorted by date (most recent first)

### GET /mood/:id/insight
Get AI-generated insights for a specific mood entry

## Testing

To run tests:
```bash
pytest
```
