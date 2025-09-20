// Replace with your computer's IP address
const API_BASE_URL = 'http://192.168.29.83:5000'; // Change this to your IP

class ApiService {
  // Log a new mood entry
  async logMood(moodData) {
    try {
      const response = await fetch(`${API_BASE_URL}/mood-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moodData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error logging mood:', error);
      throw error;
    }
  }

  // Get mood history
  async getMoodHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/mood-history`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching mood history:', error);
      throw error;
    }
  }

  // Get mood insight
  async getMoodInsight(moodId) {
    try {
      const response = await fetch(`${API_BASE_URL}/mood/${moodId}/insight`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching mood insight:', error);
      throw error;
    }
  }

  // Delete mood entry
  async deleteMood(moodId) {
    try {
      const response = await fetch(`${API_BASE_URL}/mood/${moodId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting mood:', error);
      throw error;
    }
  }

  // Upload voice note
  async uploadVoiceNote(uri, filename) {
    try {
      const formData = new FormData();
      formData.append('voice_note', {
        uri: uri,
        type: 'audio/wav',
        name: filename,
      });

      const response = await fetch(`${API_BASE_URL}/upload-voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading voice note:', error);
      throw error;
    }
  }
}

export default new ApiService();
