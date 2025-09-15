# TestYCM

## 專案概述 (only for Android)
一個利用 AI 輔助開發的一個 AI APP
- Google 登入認證
- 聊天功能（整合 OpenAI API）
- 語音識別與文字轉語音功能

## 技術架構
- **前端框架**：React Native 0.80.0
- **導航**：React Navigation（Bottom Tabs 和 Native Stack）
- **認證系統**：Firebase Authentication
- **第三方服務**：
  - Google Sign-In
  - OpenAI API
  - Firebase App

## 專案結構
```
TestYCM/
├── android/           # Android 專案配置
├── ios/              # iOS 專案配置
├── src/              # 源碼目錄
│   └── screens/      # 螢幕組件
├── __tests__/        # 測試檔案
├── App.js           # 主應用程式入口
└── package.json     # 專案依賴配置
```

## 開發環境設定
1. 確保已安裝 Node.js 和 npm
2. 安裝專案依賴：
   ```bash
   npm install
   ```

## 執行專案
1. 啟動 Metro Bundler：
   ```bash
   npm start
   ```

2. 運行 Android 版本：
   ```bash
   npm run android
   ```

## 功能說明
1. **認證系統**
   - 使用 Google Sign-In 進行使用者登入
   - Firebase Authentication 管理使用者狀態

2. **主要功能**
   - 聊天介面（ChatScreen）
   - 語音功能（VoiceScreen）
   - 個人設定（AuthScreen）

## 注意事項
- 需要有效的 Google Sign-In Web Client ID
- 需要設定 Firebase 專案並配置相關認證
- 需要 OpenAI API 金鑰進行聊天功能

## 體驗試用
- https://drive.google.com/file/d/1WUbT9HGPRxedkcPZ8u1eLAFgMP221z65/view?usp=sharing
- 請向本人所要 apk google drive 存取權
