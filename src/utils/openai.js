import OpenAI from 'react-native-openai';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

const apiKey = '';

const openAI = new OpenAI({
    apiKey
});

export const chatWithAI = async (message) => {
    try {
        const result = await openAI.chat.create({
            model: 'gpt-4.1-nano-2025-04-14',
            messages: [
                { role: 'system', content: "你是一個友善且專業的 AI 助手，請以中文回覆使用者的問題。" },
                { role: 'user', content: message }
            ],
        });

        const reply = result.choices[0].message.content;
        return reply;
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
    }
};

export const speechWithAI = async (message) => {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'tts-1',
            input: message,
            voice: 'fable',
        }),
    });

    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const filePath = `${RNFS.DocumentDirectoryPath}/speech.mp3`;
    await RNFS.writeFile(filePath, base64Data, 'base64');
    return filePath;
}

export default openAI;
