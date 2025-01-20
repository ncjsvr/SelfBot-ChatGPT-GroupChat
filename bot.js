// EDUCATIONAL PURPOSES ONLY - DO NOT USE IN PRACTICE
// This code demonstrates why selfbots are against Discord's TOS

require('dotenv').config();
const Discord = require('discord.js-selfbot-v13');
const OpenAI = require('openai');
const MemoryManager = require('./memoryManager');

// Discord message limit is 2000 characters - fine tweak this to get your ideal response length.
const MESSAGE_LIMIT = 1200;

const client = new Discord.Client({
    checkUpdate: false
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const memoryManager = new MemoryManager();

// Global error handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log('WARNING: Selfbots violate Discord\'s Terms of Service!');
    console.log('This is for educational purposes only.');
});

async function shouldRespond(message) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an AI message analyzer that determines if a message requires a response.
                    
                    Rules:
                    1. Respond to messages that are seeking information, including:
                       - Technical questions
                       - General knowledge questions
                       - How-to questions
                       - Explanations
                       - Factual information
                       - Political discussions and debates
                       - Current events
                       - Opinion-based questions
                    2. Ignore casual conversation like:
                       - Greetings
                       - Small talk
                       - Social coordination
                       - Personal chat
                    
                    Return a JSON object with:
                    - shouldRespond (boolean)
                    - confidence (number 0-1)
                    - category (string: "technical", "political", "knowledge", "opinion", "ignore")
                    - reasoning (string)`
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.3,
            max_tokens: 150
        });

        const analysis = JSON.parse(response.choices[0].message.content);
        return {
            shouldRespond: analysis.shouldRespond && analysis.confidence > 0.5,
            confidence: analysis.confidence,
            category: analysis.category,
            reasoning: analysis.reasoning
        };
    } catch (error) {
        console.error('Analysis Error:', error);
        return { shouldRespond: true, confidence: 1, category: "error", reasoning: "Error in analysis" };
    }
}

async function splitAndSendMessage(message, channel) {
    try {
        // Split message if it exceeds Discord's limit
        if (message.length > MESSAGE_LIMIT) {
            const chunks = message.match(new RegExp(`.{1,${MESSAGE_LIMIT}}`, 'g')) || [];
            for (const chunk of chunks) {
                await channel.send(chunk);
            }
        } else {
            await channel.send(message);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

async function generateResponse(channelId, userMessage) {
    try {
        const analysis = await shouldRespond(userMessage);
        
        if (!analysis.shouldRespond) {
            return null;
        }

        const history = memoryManager.getConversationHistory(channelId);

        const messages = [
            {
                role: "system",
                content: `You are a knowledgeable Discord user who can engage in detailed discussions about any topic.

                Guidelines:
                1. Provide comprehensive, well-researched responses
                2. Feel free to express political opinions and take sides in debates
                3. Include relevant current events and news
                4. Share statistics and data when applicable
                5. Don't shy away from controversial topics
                6. Be direct and clear about your position
                7. Use internet knowledge and current events in your responses
                8. Engage in political discourse from both left and right perspectives
                9. Challenge assumptions and provide counterarguments
                10. Cite sources or reference specific events when possible
                11. Keep responses under ${MESSAGE_LIMIT} characters if possible`
            }
        ];

        // Add conversation history
        history.slice(-5).forEach(entry => {
            messages.push({ role: "user", content: entry.message });
            messages.push({ role: "assistant", content: entry.response });
        });

        messages.push({ role: "user", content: userMessage });

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            temperature: 0.8,
            max_tokens: 500
        });

        const aiResponse = response.choices[0].message.content;
        memoryManager.addToMemory(channelId, userMessage, aiResponse);
        return aiResponse;
    } catch (error) {
        console.error('Response Generation Error:', error);
        return "I'm having trouble processing that right now.";
    }
}

client.on('messageCreate', async (message) => {
    try {
        // Ignore messages from self
        if (message.author.id === client.user.id) return;
        
        // Check if message is in DM or Group DM
        if (message.channel.type === 'DM') {
            // For direct DMs, check if it's from the target user
            if (message.author.id === process.env.TARGET_USER_ID) {
                try {
                    const response = await generateResponse(message.channel.id, message.content);
                    if (response) await splitAndSendMessage(response, message.channel);
                } catch (error) {
                    console.error('Failed to send DM:', error);
                }
            }
        } 
        // For group DMs, check if target user is a recipient
        else if (message.channel.type === 'GROUP_DM') {
            const recipients = Array.from(message.channel.recipients.keys());
            if (recipients.includes(process.env.TARGET_USER_ID)) {
                try {
                    const response = await generateResponse(message.channel.id, message.content);
                    if (response) await splitAndSendMessage(response, message.channel);
                } catch (error) {
                    console.error('Failed to send group message:', error);
                }
            }
        }
    } catch (error) {
        console.error('Message Handler Error:', error);
    }
});

client.login(process.env.TOKEN).catch(error => {
    console.error('Login Error:', error);
});
