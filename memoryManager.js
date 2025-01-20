const fs = require('fs');
const path = require('path');

class MemoryManager {
    constructor() {
        this.memoryFile = path.join(__dirname, 'conversation_memory.json');
        this.memory = this.loadMemory();
        this.maxMemorySize = 50; // Maximum conversations to store per channel
    }

    loadMemory() {
        try {
            if (fs.existsSync(this.memoryFile)) {
                return JSON.parse(fs.readFileSync(this.memoryFile, 'utf8'));
            }
        } catch (error) {
            console.error('Error loading memory:', error);
        }
        return {};
    }

    saveMemory() {
        try {
            fs.writeFileSync(this.memoryFile, JSON.stringify(this.memory, null, 2));
        } catch (error) {
            console.error('Error saving memory:', error);
        }
    }

    getConversationHistory(channelId) {
        if (!this.memory[channelId]) {
            this.memory[channelId] = [];
        }
        return this.memory[channelId];
    }

    addToMemory(channelId, message, response) {
        if (!this.memory[channelId]) {
            this.memory[channelId] = [];
        }

        this.memory[channelId].push({
            timestamp: Date.now(),
            message,
            response
        });

        // Trim memory if it gets too large
        if (this.memory[channelId].length > this.maxMemorySize) {
            this.memory[channelId] = this.memory[channelId].slice(-this.maxMemorySize);
        }

        this.saveMemory();
    }
}

module.exports = MemoryManager; 