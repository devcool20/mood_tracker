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
    <>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
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

            <Text style={styles.label}>Add a note</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe how you're feeling..."
              value={textNote}
              onChangeText={setTextNote}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9ca3af"
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
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.logButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogMood}
            disabled={isLoading}
          >
            <Text style={styles.logButtonText}>
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
      </View>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    marginBottom: 24,
    height: 120,
    textAlignVertical: 'top',
  },
  moodSelector: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  moodSelectorText: {
    fontSize: 16,
    color: '#374151',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#6b7280',
  },
  voiceButton: {
    backgroundColor: '#818cf8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  voiceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  removeVoiceButton: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  removeVoiceButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  logButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  historyButton: {
    backgroundColor: '#6b7280',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4b5563',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  historyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
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
