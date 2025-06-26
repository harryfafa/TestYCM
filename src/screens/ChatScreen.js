import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, InteractionManager } from 'react-native';
import { chatWithAI } from '../config/openai';
import Markdown from 'react-native-markdown-display';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const prevDataLength = useRef(0);

  const handleContentChange = (w, h) => {
    if (messages.length > prevDataLength.current) {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);
      });
    }
    prevDataLength.current = messages.length;
  };

  const sendMessage = async () => {
    if (inputText.trim()) {
      const userMessage = {
        id: Date.now().toString(),
        text: inputText,
        isUser: true,
        timestamp: new Date().toLocaleTimeString()
      };

      // 先顯示使用者的訊息
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInputText('');

      // 設定正在載入狀態
      setIsLoading(true);

      try {
        // 取得 AI 的回覆
        const aiResponse = await chatWithAI(inputText);

        // 將 AI 的回覆加入訊息列表
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          isUser: false,
          timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prevMessages => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        // 如果發生錯誤，顯示錯誤訊息
        setMessages(prevMessages => [...prevMessages, {
          id: (Date.now() + 2).toString(),
          text: '抱歉，暫時無法取得回覆。請稍後再試。',
          isUser: false,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      <Markdown style={{ body: styles.messageText }}>{item.text}</Markdown>
      <Text style={item.isUser ? styles.userTimestamp : styles.aiTimestamp}>{item.timestamp}</Text>
    </View >
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted={false}
          style={styles.messagesList}
          onContentSizeChange={handleContentChange}
        />
      </View>

      <View style={styles.inputContainer}>
        {isLoading && (
          <ActivityIndicator
            style={styles.loadingIndicator}
            size="small"
            color="#1a73e8"
          />
        )}
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="輸入訊息..."
          placeholderTextColor="#666"
          multiline
          numberOfLines={1}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>發送</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    marginTop: 12
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1a73e8',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9e9eb',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  userTimestamp: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  aiTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
