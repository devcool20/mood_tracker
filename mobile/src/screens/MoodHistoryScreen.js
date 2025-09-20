import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import ApiService from '../services/api';

const MOOD_EMOJIS = {
  Happy: '😊',
  Sad: '😢',
  Stressed: '😰',
  Neutral: '😐',
  Excited: '🤩',
  Angry: '😠',
  Anxious: '😟',
  Calm: '😌',
};

export default function MoodHistoryScreen({ navigation }) {
  const [moodHistory, setMoodHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    loadMoodHistory();
  }, []);

  const loadMoodHistory = async () => {
    try {
      const history = await ApiService.getMoodHistory();
      setMoodHistory(history);
    } catch (error) {
      Alert.alert('Error', 'Failed to load mood history');
      console.error('Error loading mood history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMoodHistory();
    setRefreshing(false);
  };

  const handleMoodPress = async (moodEntry) => {
    console.log('handleMoodPress called with:', moodEntry);
    setSelectedMood(moodEntry);
    setShowInsightModal(true);
    setLoadingInsight(true);
    
    try {
      const insightResponse = await ApiService.getMoodInsight(moodEntry._id);
      console.log('Insight response:', insightResponse);
      setInsight(insightResponse.insight);
    } catch (error) {
      Alert.alert('Error', 'Failed to load mood insight');
      console.error('Error loading insight:', error);
      setInsight('Unable to load insights at this time.');
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleDeleteMood = async (moodId) => {
    Alert.alert(
      'Delete Mood',
      'Are you sure you want to delete this mood entry?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteMood(moodId);
              // Close modal if open
              if (showInsightModal) {
                closeInsightModal();
              }
              // Refresh mood history
              loadMoodHistory();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete mood entry');
              console.error('Error deleting mood:', error);
            }
          },
        },
      ]
    );
  };

  const closeInsightModal = () => {
    setShowInsightModal(false);
    setSelectedMood(null);
    setInsight('');
  };

  const formatInsight = (insightText) => {
    if (!insightText) return <Text style={styles.debugText}>No insight text</Text>;
    
    // Split into sections by numbered headings
    const sections = insightText.split(/(?=\d+\.\s+)/);
    
    return sections.map((section, index) => {
      const trimmed = section.trim();
      if (!trimmed) return null;
      
      // Extract title and content
      const match = trimmed.match(/^(\d+\.\s+[^:]+:?)([\s\S]+)$/);
      if (match) {
        const [_, title, content] = match;
        return (
          <View key={index} style={styles.insightSection}>
            <Text style={styles.insightSectionTitle}>
              {title.replace(/\*\*/g, '')}
            </Text>
            <Text style={styles.insightSectionContent}>
              {content.replace(/\*\*/g, '').trim()}
            </Text>
          </View>
        );
      }
      
      return (
        <Text key={index} style={styles.insightText}>
          {trimmed.replace(/\*\*/g, '')}
        </Text>
      );
    }).filter(Boolean);
  };

  const extractTags = (moodEntry) => {
    const tags = [];
    const note = moodEntry.text_note?.toLowerCase() || '';
    
    // Simple keyword detection for tags
    if (note.includes('work') || note.includes('job') || note.includes('office')) {
      tags.push('work');
    }
    if (note.includes('stress') || note.includes('stressed') || note.includes('pressure')) {
      tags.push('stress');
    }
    if (note.includes('tired') || note.includes('exhausted') || note.includes('energy')) {
      tags.push('energy');
    }
    if (note.includes('happy') || note.includes('great') || note.includes('good')) {
      tags.push('positive');
    }
    if (note.includes('sad') || note.includes('down') || note.includes('low')) {
      tags.push('low mood');
    }
    if (note.includes('family') || note.includes('friend') || note.includes('social')) {
      tags.push('social');
    }
    if (note.includes('exercise') || note.includes('gym') || note.includes('workout')) {
      tags.push('exercise');
    }
    if (note.includes('sleep') || note.includes('rest') || note.includes('tired')) {
      tags.push('sleep');
    }
    
    return tags.length > 0 ? tags : ['general'];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMoodEntry = ({ item }) => (
    <View style={styles.moodEntryContainer}>
      <TouchableOpacity style={styles.moodEntry} onPress={() => handleMoodPress(item)}>
        <View style={styles.moodHeader}>
          <Text style={styles.moodEmoji}>
            {MOOD_EMOJIS[item.mood] || '😐'}
          </Text>
          <View style={styles.moodInfo}>
            <Text style={styles.moodText}>{item.mood}</Text>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          </View>
        </View>
        
        {item.text_note && (
          <Text style={styles.noteText} numberOfLines={2}>
            {item.text_note}
          </Text>
        )}
        
        {item.voice_note_url && (
          <Text style={styles.voiceNoteText}>🎤 Voice note available</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.entryDeleteButton}
        onPress={() => handleDeleteMood(item._id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.entryDeleteButtonText}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading mood history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={moodHistory}
        renderItem={renderMoodEntry}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No mood entries yet</Text>
            <Text style={styles.emptySubtext}>Start logging your moods!</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
      
      <TouchableOpacity
        style={styles.logMoodButton}
        onPress={() => navigation.navigate('MoodLogging')}
      >
        <Text style={styles.logMoodButtonText}>Log New Mood</Text>
      </TouchableOpacity>

      {/* Beautiful Insight Modal */}
      <Modal
        visible={showInsightModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeInsightModal}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalInner}>
              {/* Header */}
              <Text style={styles.modalTitle}>
                {selectedMood?.mood} {MOOD_EMOJIS[selectedMood?.mood]}
              </Text>
              <Text style={styles.modalDate}>
                {selectedMood ? new Date(selectedMood.date).toLocaleDateString() : ''}
              </Text>

              {/* Note */}
              <Text style={styles.sectionTitle}>Note:</Text>
              <Text style={styles.sectionText}>
                {selectedMood?.text_note || 'No note provided'}
              </Text>

              {/* Tags */}
              <Text style={styles.sectionTitle}>Tags & Patterns:</Text>
              <View style={styles.tagsContainer}>
                {selectedMood && extractTags(selectedMood).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Insights */}
              <Text style={styles.sectionTitle}>AI Insights:</Text>
              {loadingInsight ? (
                <Text style={styles.loadingText}>Loading insights...</Text>
              ) : insight ? (
                <View style={styles.insightsContainer}>
                  {insight.split(/(?=\d+\.\s+)/).map((section, index) => {
                    const trimmed = section.trim();
                    if (!trimmed) return null;

                    // Remove all asterisks and clean up the text
                    const cleanText = trimmed.replace(/\*\*/g, '').replace(/\*/g, '');
                    
                    // Check if it's a numbered section
                    const match = cleanText.match(/^(\d+\.\s+[^:]+:?)([\s\S]+)$/);
                    if (match) {
                      const [_, title, content] = match;
                      return (
                        <View key={index} style={styles.insightSection}>
                          <Text style={styles.insightSectionTitle}>{title.trim()}</Text>
                          <Text style={styles.insightSectionContent}>{content.trim()}</Text>
                        </View>
                      );
                    }
                    return (
                      <Text key={index} style={styles.insightText}>{cleanText}</Text>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.noInsightText}>No insights available</Text>
              )}

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => handleDeleteMood(selectedMood._id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={closeInsightModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 40,
    marginBottom: 40,
    borderRadius: 20,
    maxHeight: '90%',
    position: 'relative',
  },
  modalInner: {
    padding: 20,
    paddingBottom: 80, // Space for fixed close button
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
  },
  modalDate: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalBody: {
    flex: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  insightText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 10,
  },
  noInsightText: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tag: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 12,
    flex: 0.48,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 12,
    flex: 0.48,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  moodEntryContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  moodEntry: {
    flex: 1,
    padding: 16,
  },
  entryDeleteButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderLeftWidth: 1,
    borderLeftColor: '#fee2e2',
  },
  entryDeleteButtonText: {
    fontSize: 18,
    color: '#ef4444',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  listContainer: {
    paddingVertical: 16,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  moodInfo: {
    flex: 1,
  },
  moodText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  noteText: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 8,
    lineHeight: 20,
  },
  voiceNoteText: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 8,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  logMoodButton: {
    backgroundColor: '#6366f1',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logMoodButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalInnerContent: {
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
  },
  modalDate: {
    fontSize: 16,
    color: '#6b7280',
  },
  noteSection: {
    marginBottom: 20,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tag: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalScrollView: {
    flex: 1,
    marginBottom: 10,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalContentWrapper: {
    flex: 1,
    paddingBottom: 20,
  },
  insightsSection: {
    marginBottom: 20,
  },
  insightsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  insightsContainer: {
    // Container for insights without height restriction
  },
  insightSection: {
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  insightSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  insightSectionContent: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  insightText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  noInsightText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  closeButton: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
  },
});
