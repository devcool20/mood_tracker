import pytest
from app import app
from datetime import datetime
import json
from bson import ObjectId

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_log_mood(client):
    # Test successful mood logging
    data = {
        'mood': 'Happy',
        'date': datetime.utcnow().isoformat(),
        'text_note': 'Test note'
    }
    response = client.post('/mood-log', json=data)
    assert response.status_code == 201
    assert 'id' in response.json

    # Test missing required fields
    incomplete_data = {
        'mood': 'Happy'
    }
    response = client.post('/mood-log', json=incomplete_data)
    assert response.status_code == 400

def test_get_mood_history(client):
    response = client.get('/mood-history')
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_mood_insight(client):
    # First create a mood entry
    data = {
        'mood': 'Happy',
        'date': datetime.utcnow().isoformat(),
        'text_note': 'Test note for insight'
    }
    response = client.post('/mood-log', json=data)
    mood_id = response.json['id']

    # Test getting insight
    response = client.get(f'/mood/{mood_id}/insight')
    assert response.status_code == 200
    assert 'insight' in response.json

    # Test invalid mood ID
    response = client.get('/mood/invalid_id/insight')
    assert response.status_code == 500  # or 404 depending on the error handling
