/* ==========================================
   SUMAN OFFICIAL - MAIN SCRIPT
   Chat History + Multiple Conversations
========================================== */

// ==========================================
// TYPING ANIMATION
// ==========================================

const words = [
    "Future AI Developer",
    "Freelancer",
    "Data Entry Specialist",
    "Student"
];

let wordIndex = 0;
let charIndex = 0;
let deleting = false;

const typingElement = document.getElementById("typing");

function typeEffect() {
    if (!typingElement) return;

    const currentWord = words[wordIndex];

    if (!deleting) {
        typingElement.textContent =
            currentWord.substring(0, charIndex + 1);

        charIndex++;

        if (charIndex === currentWord.length) {
            deleting = true;
            setTimeout(typeEffect, 1200);
            return;
        }
    } else {
        typingElement.textContent =
            currentWord.substring(0, charIndex - 1);

        charIndex--;

        if (charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        }
    }

    setTimeout(typeEffect, deleting ? 60 : 120);
}

typeEffect();


// ==========================================
// DARK / LIGHT MODE
// ==========================================

const darkModeBtn = document.getElementById("darkModeBtn");

if (darkModeBtn) {
    const savedTheme = localStorage.getItem("sumanTheme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }

    darkModeBtn.textContent =
        document.body.classList.contains("light-mode") ? "🌙" : "☀️";

    darkModeBtn.addEventListener("click", function () {
        document.body.classList.toggle("light-mode");

        const isLight =
            document.body.classList.contains("light-mode");

        localStorage.setItem(
            "sumanTheme",
            isLight ? "light" : "dark"
        );

        darkModeBtn.textContent = isLight ? "🌙" : "☀️";
    });
}


// ==========================================
// SUMAN AI ELEMENTS
// ==========================================

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const voiceBtn = document.getElementById("voiceBtn");
const stopVoiceBtn = document.getElementById("stopVoiceBtn");
const clearChatBtn = document.getElementById("clearChatBtn");

const newChatBtn = document.getElementById("newChatBtn");
const toggleHistoryBtn = document.getElementById("toggleHistoryBtn");
const historyPanel = document.getElementById("historyPanel");
const chatHistoryList = document.getElementById("chatHistoryList");
const activeChatTitle = document.getElementById("activeChatTitle");

const STORAGE_KEY = "sumanAIConversationsV2";

const welcomeMessage =
    "Hello! 👋 I'm Suman AI. How can I help you?";


// ==========================================
// CREATE CHAT ID
// ==========================================

function createChatId() {
    return Date.now().toString() +
        Math.random().toString(36).slice(2, 8);
}


// ==========================================
// LOAD SAVED CONVERSATIONS
// ==========================================

let conversations = [];
let activeChatId = null;

function saveAllChats() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                conversations: conversations,
                activeChatId: activeChatId
            })
        );
    } catch (error) {
        console.error("Could not save conversations:", error);
    }
}

function loadAllChats() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            const data = JSON.parse(saved);

            if (Array.isArray(data.conversations)) {
                conversations = data.conversations.filter(chat =>
                    chat &&
                    typeof chat.id === "string" &&
                    Array.isArray(chat.messages)
                );

                activeChatId = data.activeChatId || null;
            }
        }
    } catch (error) {
        console.error("Chat loading error:", error);
        conversations = [];
    }

    // Migrate the previous single-chat history if present
    if (conversations.length === 0) {
        try {
            const oldSaved = localStorage.getItem("sumanAIChatHistory");

            if (oldSaved) {
                const oldMessages = JSON.parse(oldSaved);

                if (Array.isArray(oldMessages)) {
                    const migratedMessages = oldMessages
                        .filter(item =>
                            item &&
                            ["user", "ai"].includes(item.type) &&
                            typeof item.message === "string"
                        )
                        .filter(item =>
                            item.message !== welcomeMessage
                        );

                    if (migratedMessages.length > 0) {
                        const oldChat = {
                            id: createChatId(),
                            title: "Previous Chat",
                            messages: migratedMessages,
                            updatedAt: Date.now()
                        };

                        conversations.push(oldChat);
                        activeChatId = oldChat.id;
                    }
                }
            }
        } catch (error) {
            console.error("Old chat migration error:", error);
        }
    }

    // Start a blank chat if there is no saved conversation
    if (!getActiveChat()) {
        createNewChat(false);
    }

    saveAllChats();
}

function getActiveChat() {
    return conversations.find(
        chat => chat.id === activeChatId
    );
}


// ==========================================
// CREATE NEW CHAT
// ==========================================

function createNewChat(save = true) {
    const newChat = {
        id: createChatId(),
        title: "New Chat",
        messages: [],
        updatedAt: Date.now()
    };

    conversations.unshift(newChat);
    activeChatId = newChat.id;

    if (save) {
        saveAllChats();
    }

    renderCurrentChat();
    renderChatHistory();

    if (userInput) {
        userInput.value = "";
        userInput.focus();
    }

    if (historyPanel) {
        historyPanel.hidden = true;
    }
}


// ==========================================
// RENDER CURRENT CHAT
// ==========================================

function renderCurrentChat() {
    if (!chatBox) return;

    const chat = getActiveChat();

    chatBox.innerHTML = "";

    if (!chat || chat.messages.length === 0) {
        addMessageToScreen(welcomeMessage, "ai");
    } else {
        chat.messages.forEach(item => {
            addMessageToScreen(item.message, item.type);
        });
    }

    if (activeChatTitle) {
        activeChatTitle.textContent =
            chat && chat.title ? chat.title : "New Chat";
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}


// ==========================================
// DISPLAY ONE MESSAGE
// ==========================================

function addMessageToScreen(message, type) {
    if (!chatBox) return;

    const div = document.createElement("div");

    div.className =
        type === "user" ? "user-message" : "ai-message";

    const strong = document.createElement("strong");

    strong.textContent =
        type === "user" ? "You: " : "Suman AI: ";

    div.appendChild(strong);
    div.appendChild(document.createTextNode(message));

    chatBox.appendChild(div);
}


// ==========================================
// ADD AND SAVE MESSAGE
// ==========================================

function addMessage(message, type) {
    const chat = getActiveChat();

    if (!chat) return;

    chat.messages.push({
        type: type,
        message: message
    });

    // Keep up to 100 messages in each chat
    chat.messages = chat.messages.slice(-100);

    chat.updatedAt = Date.now();

    // Set chat title from the first user message
    if (type === "user" && chat.title === "New Chat") {
        chat.title = message.slice(0, 35);

        if (message.length > 35) {
            chat.title += "...";
        }
    }

    saveAllChats();
    renderCurrentChat();
    renderChatHistory();
}


// ==========================================
// CHAT HISTORY LIST
// ==========================================

function renderChatHistory() {
    if (!chatHistoryList) return;

    chatHistoryList.innerHTML = "";

    const sortedChats = [...conversations].sort(
        (a, b) => b.updatedAt - a.updatedAt
    );

    if (sortedChats.length === 0) {
        const empty = document.createElement("p");
        empty.className = "history-empty";
        empty.textContent = "No previous chats yet.";
        chatHistoryList.appendChild(empty);
        return;
    }

    sortedChats.forEach(chat => {
        const item = document.createElement("div");
        item.className = "history-item";

        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.className = "history-open";
        openButton.textContent = chat.title || "New Chat";
        openButton.title = chat.title || "New Chat";

        if (chat.id === activeChatId) {
            openButton.style.border = "2px solid var(--accent)";
        }

        openButton.addEventListener("click", function () {
            openChat(chat.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "history-delete";
        deleteButton.textContent = "🗑️";
        deleteButton.title = "Delete this chat";

        deleteButton.addEventListener("click", function () {
            deleteChat(chat.id);
        });

        item.appendChild(openButton);
        item.appendChild(deleteButton);

        chatHistoryList.appendChild(item);
    });
}


// ==========================================
// OPEN OLD CHAT
// ==========================================

function openChat(id) {
    const chat = conversations.find(item => item.id === id);

    if (!chat) return;

    activeChatId = id;

    saveAllChats();
    renderCurrentChat();
    renderChatHistory();

    if (historyPanel) {
        historyPanel.hidden = true;
    }
}


// ==========================================
// DELETE ONE CHAT
// ==========================================

function deleteChat(id) {
    const chat = conversations.find(item => item.id === id);

    if (!chat) return;

    const confirmed = confirm(
        "Delete this conversation?"
    );

    if (!confirmed) return;

    conversations = conversations.filter(
        item => item.id !== id
    );

    if (activeChatId === id) {
        if (conversations.length > 0) {
            activeChatId = conversations[0].id;
        } else {
            activeChatId = null;
            createNewChat(false);
        }
    }

    saveAllChats();
    renderCurrentChat();
    renderChatHistory();
}


// ==========================================
// INITIAL LOAD
// ==========================================

loadAllChats();
renderCurrentChat();
renderChatHistory();


// ==========================================
// VOICE OUTPUT
// ==========================================

function speakAI(text) {
    if (!("speechSynthesis" in window)) return;

    const cleanText = text.replace(/<[^>]*>/g, "");

    const speech = new SpeechSynthesisUtterance(cleanText);

    speech.lang = /[\u0980-\u09FF]/.test(cleanText)
        ? "bn-IN"
        : "en-IN";

    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
}


// ==========================================
// SEND MESSAGE WITH MEMORY
// ==========================================

let isSending = false;

async function sendMessage() {
    if (!userInput || !chatBox || isSending) return;

    const message = userInput.value.trim();

    if (!message) return;

    const chat = getActiveChat();

    if (!chat) return;

    // Send previous messages to the API
    const previousHistory = chat.messages
        .slice(-12)
        .map(item => ({
            type: item.type,
            message: item.message
        }));

    isSending = true;

    addMessage(message, "user");

    userInput.value = "";

    if (sendBtn) sendBtn.disabled = true;

    const thinking = document.createElement("div");
    thinking.className = "ai-message";
    thinking.textContent = "Suman AI: Thinking... 🤔";

    chatBox.appendChild(thinking);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("/api/chat", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message,
                history: previousHistory
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "AI request failed"
            );
        }

        const answer = data.answer;

        if (!answer) {
            throw new Error("Empty AI response");
        }

        thinking.remove();

        addMessage(answer, "ai");

        speakAI(answer);

    } catch (error) {
        console.error("Suman AI Error:", error);

        thinking.remove();

        addMessage(
            "Sorry! Suman AI এখন উত্তর দিতে পারছে না. Please try again.",
            "ai"
        );

    } finally {
        isSending = false;

        if (sendBtn) sendBtn.disabled = false;

        if (userInput) userInput.focus();
    }
}


// ==========================================
// SEND BUTTON
// ==========================================

if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
}


// ==========================================
// ENTER KEY
// ==========================================

if (userInput) {
    userInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
}


// ==========================================
// NEW CHAT BUTTON
// ==========================================

if (newChatBtn) {
    newChatBtn.addEventListener("click", function () {
        createNewChat(true);
    });
}


// ==========================================
// TOGGLE CHAT HISTORY
// ==========================================

if (toggleHistoryBtn && historyPanel) {
    toggleHistoryBtn.addEventListener("click", function () {
        historyPanel.hidden = !historyPanel.hidden;

        if (!historyPanel.hidden) {
            renderChatHistory();
        }
    });
}


// ==========================================
// CLEAR CURRENT CHAT
// ==========================================

if (clearChatBtn) {
    clearChatBtn.addEventListener("click", function () {
        const chat = getActiveChat();

        if (!chat) return;

        const confirmed = confirm(
            "Clear all messages in this chat?"
        );

        if (!confirmed) return;

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        chat.messages = [];
        chat.title = "New Chat";
        chat.updatedAt = Date.now();

        saveAllChats();
        renderCurrentChat();
        renderChatHistory();

        if (userInput) {
            userInput.value = "";
        }
    });
}


// ==========================================
// VOICE INPUT
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (voiceBtn && SpeechRecognition) {
    const recognition = new SpeechRecognition();

    recognition.lang = "bn-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    voiceBtn.addEventListener("click", function () {
        try {
            recognition.start();
            voiceBtn.textContent = "🔴";
        } catch (error) {
            console.log("Voice recognition:", error);
        }
    });

    recognition.onresult = function (event) {
        const text = event.results[0][0].transcript;

        if (userInput) {
            userInput.value = text;
        }

        voiceBtn.textContent = "🎤";
    };

    recognition.onerror = function () {
        voiceBtn.textContent = "🎤";
    };

    recognition.onend = function () {
        voiceBtn.textContent = "🎤";
    };

} else if (voiceBtn) {
    voiceBtn.disabled = true;
    voiceBtn.textContent = "❌";
}


// ==========================================
// STOP AI VOICE
// ==========================================

if (stopVoiceBtn) {
    stopVoiceBtn.addEventListener("click", function () {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    });
}


// ==========================================
// CONSOLE
// ==========================================

console.log("Suman Official loaded successfully!");
console.log("Suman AI Multiple Chat History enabled!");
           
