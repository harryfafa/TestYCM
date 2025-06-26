import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, PermissionsAndroid, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Voice from '@react-native-voice/voice';
import { speechWithAI, chatWithAI } from '../config/openai';
import TTS from 'react-native-tts';
import Markdown from 'react-native-markdown-display';
import Sound from 'react-native-sound';
Sound.setCategory('Playback');

export default function VoiceScreen() {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [status, setStatus] = useState('');
  const [aiResponse, setAiResponse] = useState(``);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 設定語音辨識事件監聽器
    Voice.onSpeechStart = (e) => {
      console.log('開始語音辨識:', e);
      setStatus('正在錄音...');
    };

    // 設定 TTS 初始化
    TTS.setDefaultLanguage('zh-TW');
    TTS.setDefaultRate(0.5);
    TTS.setDefaultPitch(1.0);

    Voice.onSpeechEnd = (e) => {
      console.log('結束語音辨識:', e);
      setStatus('辨識完成');
    };

    Voice.onSpeechError = (e) => {
      console.log('語音辨識錯誤:', e);
      setStatus('發生錯誤，請重新輸入');
      setIsLoading(false);
      setIsListening(false);
    };

    Voice.onSpeechResults = (e) => {
      console.log('辨識結果:', e.value);
      const recognizedText = e.value[0] || '';
      setTranscription(recognizedText);

      // 當辨識完成時，呼叫 OpenAI API
      if (recognizedText) {
        setStatus('正在處理中...');
        setIsLoading(true);

        chatWithAI(recognizedText)
          .then(response => {
            setAiResponse(response);
            setStatus('點擊開始錄音');
          })
          .catch(error => {
            console.error('OpenAI API 錯誤:', error);
            setAiResponse('發生錯誤');
            setStatus('發生錯誤');
          })
          .finally(() => {
            setIsLoading(false);
            setIsListening(false);
          });
      }
    };

    // 在組件卸載時清除事件監聽器
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // 處理 AI 回覆的語音播放
  useEffect(() => {
    if (aiResponse) {
      speechWithAI(aiResponse)
        .then(filePath => {
          console.log('Audio file path:', filePath);

          const sound = new Sound(filePath, '', (error) => {
            if (error) {
              console.log('播放失敗:', error);
              return;
            }
            sound.play((success) => {
              if (!success) {
                console.log('播放時發生錯誤');
              }
              sound.release(); // 播放完釋放資源
            });
          });
        })
        .catch(err => {
          console.log('TTS 發生錯誤:', err);
        });
    }
  }, [aiResponse]);

  // 請求錄音權限
  const requestPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: '錄音權限',
          message: '這個應用程式需要錄音權限才能進行語音辨識',
          buttonNeutral: '稍後再問',
          buttonNegative: '拒絕',
          buttonPositive: '同意',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('錄音權限已獲取');
        return true;
      } else {
        console.log('錄音權限被拒絕');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // 處理語音辨識
  const handleVoiceButtonPress = async () => {
    if (!isListening) {
      // 檢查是否已有權限
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setStatus('請授予錄音權限');
        return;
      }

      try {
        // 開始語音辨識
        await Voice.start('zh-TW');
        setIsListening(true);
        setStatus('正在錄音...');
      } catch (err) {
        console.error('開始語音辨識時發生錯誤:', err);
        setStatus('發生錯誤');
      }
    } else {
      try {
        // 停止語音辨識
        await Voice.stop();
        await Voice.cancel(); // 確保完全停止
        setIsListening(false);
        setStatus('點擊開始錄音');
      } catch (err) {
        console.error('停止語音辨識時發生錯誤:', err);
        setStatus('發生錯誤');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>語音輸入</Text>
        <View style={styles.transcriptionContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.transcriptionTitle}>辨識結果:</Text>
            <Text style={styles.transcriptionText}>{transcription}</Text>
            <Text style={styles.transcriptionTitle}>AI 回覆:</Text>
            <Markdown style={{ body: styles.aiResponseText }}>{aiResponse}</Markdown>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#000" />
                <Text style={styles.loadingText}>正在處理中...</Text>
              </View>
            )}
          </ScrollView>
        </View>
        <TouchableOpacity
          style={[styles.voiceButton, isListening && styles.recordingButton]}
          onPress={handleVoiceButtonPress}
        >
          <Ionicons
            name={isListening ? 'mic-off' : 'mic'}
            size={32}
            color={isListening ? '#fff' : '#000'}
          />
          <Text style={[styles.voiceButtonText, isListening && styles.recordingButtonText]}>
            {status}
          </Text>
          {isListening && (
            <ActivityIndicator
              style={styles.recordingIndicator}
              size="small"
              color="#fff"
            />
          )}
        </TouchableOpacity>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    marginTop: 20
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000',
  },
  transcriptionContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '75%',
  },
  transcriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  transcriptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  transcriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  transcriptionText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  voiceButton: {
    height: '10%',
    backgroundColor: '#1a73e8',
    padding: 20,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    maxWidth: 250,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: '#ff4444',
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  recordingButtonText: {
    color: '#fff',
  },
  recordingIndicator: {
    marginLeft: 10,
  },
  aiResponseText: {
    color: 'black'
  },
  scrollContainer: {
    justifyContent: 'center'
  }
});
