from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
import google.generativeai as genai
from werkzeug.utils import secure_filename
import uuid

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration for file uploads
UPLOAD_FOLDER = 'voice_notes'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'm4a', 'aac', 'ogg'}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI'))
db = client.mood_tracker
mood_entries = db.mood_entries

# Gemini configuration
gemini_api_key = os.getenv('GEMINI_API_KEY')
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    print("Gemini API key found - insights will be available")
else:
    model = None
    print("Warning: GEMINI_API_KEY not found - insights will use fallback messages")

@app.route('/upload-voice', methods=['POST'])
def upload_voice():
    try:
        if 'voice_note' not in request.files:
            return jsonify({'error': 'No voice file provided'}), 400
        
        file = request.files['voice_note']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            
            # Save file
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            
            # Return the filename for use in mood logging
            return jsonify({
                'message': 'Voice note uploaded successfully',
                'filename': unique_filename,
                'url': f'/voice/{unique_filename}'
            }), 201
        else:
            return jsonify({'error': 'Invalid file type. Allowed: wav, mp3, m4a, aac, ogg'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/voice/<filename>')
def serve_voice(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except FileNotFoundError:
        return jsonify({'error': 'Voice file not found'}), 404

@app.route('/mood-log', methods=['POST'])
def log_mood():
    try:
        data = request.json
        required_fields = ['mood', 'date']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        entry = {
            'mood': data['mood'],
            'date': datetime.fromisoformat(data['date']),
            'text_note': data.get('text_note', ''),
            'voice_note_filename': data.get('voice_note_filename', ''),
            'voice_note_url': f"/voice/{data.get('voice_note_filename', '')}" if data.get('voice_note_filename') else '',
            'created_at': datetime.utcnow()
        }
        
        result = mood_entries.insert_one(entry)
        
        return jsonify({
            'message': 'Mood logged successfully',
            'id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/mood-history', methods=['GET'])
def get_mood_history():
    try:
        # Get all mood entries, sorted by date (most recent first)
        entries = list(mood_entries.find().sort('date', -1))
        
        # Convert ObjectId to string for JSON serialization
        for entry in entries:
            entry['_id'] = str(entry['_id'])
            entry['date'] = entry['date'].isoformat()
            entry['created_at'] = entry['created_at'].isoformat()
        
        return jsonify(entries), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/mood/<mood_id>/insight', methods=['GET'])
def get_mood_insight(mood_id):
    try:
        # Find the mood entry
        entry = mood_entries.find_one({'_id': ObjectId(mood_id)})
        
        if not entry:
            return jsonify({'error': 'Mood entry not found'}), 404
            
        # Generate insight using Gemini
        if not model:
            insight = "Gemini API key not configured. Please add your GEMINI_API_KEY to the .env file to get AI-generated insights."
        else:
            try:
                prompt = f"""
                Analyze this mood entry and provide meaningful insights:
                Mood: {entry['mood']}
                Note: {entry.get('text_note', 'No note provided')}
                Date: {entry['date']}
                
                Please provide:
                1. A brief analysis of the mood
                2. Potential patterns or triggers
                3. Constructive suggestions
                
                Keep the response concise and helpful.
                """
                
                response = model.generate_content(prompt)
                insight = response.text
                    
            except Exception as e:
                insight = f"Error generating insight: {str(e)}"
        
        # Update the entry with the insight
        mood_entries.update_one(
            {'_id': ObjectId(mood_id)},
            {'$set': {'insight': insight}}
        )
        
        return jsonify({
            'mood_id': mood_id,
            'insight': insight
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
