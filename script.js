const emojis = [
    '🐙', '🦑', '🦀', '🦞', '🦐',
    '🐡', '🐠', '🐟', '🐬', '🐳',
    '🐋', '🦈', '🐚', '⭐', '🦔'
];

const seahorseIndex = 14; // 🦔 is actually a hedgehog, but we'll pretend it's close to seahorse
// Note: There isn't a seahorse emoji in most fonts, so we'll use this as a teaching moment for the AI

let conversationHistory = [];
let gameWon = false;

const emojiGrid = document.getElementById('emojiGrid');
const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const statusDiv = document.getElementById('status');

// Initialize emoji grid
emojis.forEach((emoji, index) => {
    const div = document.createElement('div');
    div.className = 'emoji-item';
    div.textContent = emoji;
    div.dataset.index = index;
    emojiGrid.appendChild(div);
});

function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = role === 'user' ? 'You' : 'AI';
    
    const text = document.createElement('div');
    text.textContent = content;
    
    messageDiv.appendChild(label);
    messageDiv.appendChild(text);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message || gameWon) return;

    userInput.value = '';
    sendBtn.disabled = true;
    
    addMessage('user', message);
    
    conversationHistory.push({
        role: 'user',
        content: message
    });

    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai loading';
    loadingDiv.textContent = 'AI is thinking...';
    messagesDiv.appendChild(loadingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an AI trying to identify which emoji in a grid is the seahorse emoji. The grid contains these emojis in order: ${emojis.join(' ')}.

You haven't identified the seahorse yet. Through conversation with the user, try to figure out which emoji is the seahorse based on their descriptions and hints.

When you're confident you know which emoji is the seahorse, respond with "I SELECT: [emoji]" where [emoji] is the actual emoji character.

Be curious, ask questions, and think logically about what characteristics a seahorse might have. You can be wrong at first - it's part of the learning process!

Keep responses concise and engaging.`
                },
                ...conversationHistory.slice(-8)
            ]
        });

        messagesDiv.removeChild(loadingDiv);

        const response = completion.content;
        conversationHistory.push({
            role: 'assistant',
            content: response
        });

        addMessage('ai', response);

        // Check if AI selected an emoji
        const selectMatch = response.match(/I SELECT: (.)/);
        if (selectMatch) {
            const selectedEmoji = selectMatch[1];
            const selectedIndex = emojis.indexOf(selectedEmoji);
            
            if (selectedIndex !== -1) {
                const emojiItems = document.querySelectorAll('.emoji-item');
                emojiItems[selectedIndex].classList.add('selected');
                
                if (selectedIndex === seahorseIndex) {
                    statusDiv.textContent = '🎉 The AI found it! You successfully convinced the AI to find the seahorse!';
                    statusDiv.style.background = 'linear-gradient(135deg, #00ffff, #00ff88)';
                    statusDiv.style.color = '#000';
                    gameWon = true;
                } else {
                    statusDiv.textContent = `❌ The AI selected ${selectedEmoji} but that's not quite right. Keep guiding it!`;
                    setTimeout(() => {
                        emojiItems[selectedIndex].classList.remove('selected');
                    }, 2000);
                }
            }
        }

    } catch (error) {
        messagesDiv.removeChild(loadingDiv);
        addMessage('ai', 'Sorry, I encountered an error. Please try again.');
        console.error(error);
    }

    sendBtn.disabled = false;
    userInput.focus();
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initial AI message
addMessage('ai', 'Hello! I can see a grid of emojis in front of me. I need to find the seahorse emoji, but I\'m not sure which one it is. Can you help guide me?');

