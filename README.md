# Discord Selfbot with GPT-4 (Educational Purposes Only)

⚠️ **WARNING: This is an educational demonstration of why selfbots violate Discord's Terms of Service. Using selfbots can get your account banned.**

## What This Bot Does
This selfbot demonstrates how AI could be used to automate a Discord user account. It responds in:
- Direct Messages between you and the target user
- Any message in Group DMs where the target user is a member (responds to all users in that group)

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `example.env` file, rename to `.env` and enter your details:
   ```env
   TOKEN=your_discord_token_here
   TARGET_USER_ID=your_discord_user_id
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### How to Get These Values:

#### Discord User Token
1. Open Discord in your web browser
2. Press F12 for Developer Tools
3. Go to Network tab
4. Send a message in any chat
5. Look for a request named "@me"
6. In request headers, find "authorization"
7. That's your user token

⚠️ **Never share your user token - it gives full access to your account**

#### Your Discord User ID
1. Enable Developer Mode in Discord (User Settings > App Settings > Advanced)
2. Right-click your name
3. Click "Copy ID"
4. Put this ID in `TARGET_USER_ID`

When this ID is in a group DM, the bot will respond to all messages from any user in that group.

#### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it to `OPENAI_API_KEY` in your `.env` file

## Running the Bot
```bash
npm start
```

## How It Works
- In DMs: Only responds to messages from the target user
- In Group DMs: Responds to any message if the target user is in the group
- Uses GPT-4 to analyze messages and generate responses
- Maintains conversation memory per chat
- Ignores casual greetings and small talk

⚠️ **Remember: This is for educational purposes only. Using selfbots violates Discord's Terms of Service and can result in account termination.**