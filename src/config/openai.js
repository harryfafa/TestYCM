import OpenAI from 'react-native-openai';

const openAI = new OpenAI({
    apiKey: '',
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

export default openAI;
