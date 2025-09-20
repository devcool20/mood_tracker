import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import ApiService from '../services/api';

const MOOD_OPTIONS = [
  { label: 'Happy 😊', value: 'Happy' },
  { label: 'Sad 😢', value: 'Sad' },
  { label: 'Stressed 😰', value: 'Stressed' },
  { label: 'Neutral 😐', value: 'Neutral' },
  { label: 'Excited 🤩', value: 'Excited' },
  { label: 'Angry 😠', value: 'Angry' },
  { label: 'Anxious 😟', value: 'Anxious' },
  { label: 'Calm 😌', value: 'Calm' },
];

export default function MoodLoggingScreen({ navigation }) {
  const [mood, setMood] = useState('');
  const [textNote, setTextNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceNote, setVoiceNote] = useState(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  const handleLogMood = async () => {
    if (!mood) {
      Alert.alert('Error', 'Please select a mood');
      return;
    }

    setIsLoading(true);

    try {
      const moodData = {
        mood: mood,
        date: new Date().toISOString(),
        text_note: textNote,
      };

      // If voice note exists, upload it first
      if (voiceNote) {
        try {
          const uploadResponse = await ApiService.uploadVoiceNote(
            voiceNote.uri,
            voiceNote.name
          );
          moodData.voice_note_filename = uploadResponse.filename;
        } catch (error) {
          console.error('Voice upload failed:', error);
          Alert.alert('Warning', 'Voice note upload failed, but mood will still be logged');
        }
      }

      const response = await ApiService.logMood(moodData);
      
      Alert.alert('Success', 'Mood logged successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setMood('');
            setTextNote('');
            setVoiceNote(null);
            navigation.navigate('MoodHistory');
          }
        }
      ]);

    } catch (error) {
      Alert.alert('Error', 'Failed to log mood. Please try again.');
      console.error('Error logging mood:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickVoiceNote = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setVoiceNote(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick voice note');
      console.error('Error picking voice note:', error);
    }
  };

  const selectMood = (moodValue) => {
    setMood(moodValue);
    setShowMoodPicker(false);
  };

  const getSelectedMoodLabel = () => {
    const selected = MOOD_OPTIONS.find(option => option.value === mood);
    return selected ? selected.label : 'Select your mood...';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>How are you feeling?</Text>
        
        <TouchableOpacity 
          style={styles.moodSelector}
          onPress={() => setShowMoodPicker(true)}
        >
          <Text style={[styles.moodSelectorText, !mood && styles.placeholderText]}>
            {getSelectedMoodLabel()}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Add a note.</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe how you're feeling..."
          value={textNote}
          onChangeText={setTextNote}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Voice Note (optional)</Text>
        <TouchableOpacity style={styles.voiceButton} onPress={pickVoiceNote}>
          <Text style={styles.voiceButtonText}>
            {voiceNote ? `Selected: ${voiceNote.name}` : 'Record or Select Voice Note'}
          </Text>
        </TouchableOpacity>

        {voiceNote && (
          <TouchableOpacity 
            style={styles.removeVoiceButton} 
            onPress={() => setVoiceNote(null)}
          >
            <Text style={styles.removeVoiceButtonText}>Remove Voice Note</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleLogMood}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Logging...' : 'Log Mood'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('MoodHistory')}
        >
          <Text style={styles.historyButtonText}>View Mood History</Text>
        </TouchableOpacity>
      </View>

      {/* Mood Picker Modal */}
      <Modal
        visible={showMoodPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMoodPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Mood</Text>
            <FlatList
              data={MOOD_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.moodOption}
                  onPress={() => selectMood(item.value)}
                >
                  <Text style={styles.moodOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowMoodPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: '#374151',
  },
  moodSelector: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodSelectorText: {
    fontSize: 16,
    color: '#374151',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    textAlignVertical: 'top',
    fontSize: 16,
  },
  voiceButton: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  voiceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  removeVoiceButton: {
    backgroundColor: '#ef4444',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  removeVoiceButtonText: {
    color: 'white',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyButton: {
    backgroundColor: '#6b7280',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  historyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#374151',
  },
  moodOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  moodOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
