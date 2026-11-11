
/* ==========================================
   SUMAN OFFICIAL - MAIN SCRIPT
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
        darkModeBtn.textContent = "🌙";
    } else {
        darkModeBtn.textContent = "☀️";
    }

    darkModeBtn.addEventListener("click", function () {

        document.body.classList.toggle("light-mode");

        const isLight =
            document.body.classList.contains("light-mode");

        localStorage.setItem(
            "sumanTheme",
            isLight ? "light" : "dark"
        );

        darkModeBtn.textContent =
            isLight ? "🌙" : "☀️";
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

const STORAGE_KEY = "sumanAIChatHistory";


// ==========================================
// DEFAULT WELCOME MESSAGE
// ==========================================

const welcomeMessage = {
    type: "ai",
    message: "Hello! 👋 I'm Suman AI. How can I help you?"
};


// ==========================================
// LOAD CHAT HISTORY
// ==========================================

let chatHistory = [];

try {
    const savedChat = localStorage.getItem(STORAGE_KEY);

    if (savedChat) {
        chatHistory = JSON.parse(savedChat);

        if (!Array.isArray(chatHistory)) {
            chatHistory = [];
        }
    }

} catch (error) {
    console.error("Chat history error:", error);
    chatHistory = [];
}

if (chatHistory.length === 0) {
    chatHistory = [welcomeMessage];
}


// ==========================================
// SAVE CHAT HISTORY
// ==========================================

function saveChatHistory() {

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(chatHistory)
        );

    } catch (error) {
        console.error("Could not save chat:", error);
    }
}


// ==========================================
// DISPLAY MESSAGE
// ==========================================

function addMessage(message, type, save = true) {

    if (!chatBox) return;

    const div = document.createElement("div");

    div.className =
        type === "user"
            ? "user-message"
            : "ai-message";

    const strong = document.createElement("strong");

    strong.textContent =
        type === "user"
            ? "You: "
            : "Suman AI: ";

    div.appendChild(strong);

    const text = document.createTextNode(message);

    div.appendChild(text);

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;

    if (save) {
        chatHistory.push({
            type: type,
            message: message
        });

        saveChatHistory();
    }
}


// ==========================================
// RESTORE CHAT HISTORY
// ==========================================

function loadChatHistory() {

    if (!chatBox) return;

    chatBox.innerHTML = "";

    chatHistory.forEach(function (item) {

        const div = document.createElement("div");

        div.className =
            item.type === "user"
                ? "user-message"
                : "ai-message";

        const strong = document.createElement("strong");

        strong.textContent =
            item.type === "user"
                ? "You: "
                : "Suman AI: ";

        div.appendChild(strong);

        div.appendChild(
            document.createTextNode(item.message)
        );

        chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

loadChatHistory();


// ==========================================
// SUMAN AI VOICE OUTPUT
// ==========================================

function speakAI(text) {

    if (!("speechSynthesis" in window)) return;

    const cleanText = text.replace(/<[^>]*>/g, "");

    const speech = new SpeechSynthesisUtterance(cleanText);

    speech.lang = "en-IN";
    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(speech);
}


// ==========================================
// SEND MESSAGE TO VERCEL API
// ==========================================

let isSending = false;

async function sendMessage() {

    if (!userInput || !chatBox || isSending) return;

    const message = userInput.value.trim();

    if (!message) return;

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
                message: message
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

        userInput.focus();
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

    userInput.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
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

    voiceBtn.addEventListener("click", function() {

        try {
            recognition.start();
            voiceBtn.textContent = "🔴";
        } catch (error) {
            console.log("Voice recognition:", error);
        }

    });

    recognition.onresult = function(event) {

        const text = event.results[0][0].transcript;

        if (userInput) {
            userInput.value = text;
        }

        voiceBtn.textContent = "🎤";

    };

    recognition.onerror = function() {
        voiceBtn.textContent = "🎤";
    };

    recognition.onend = function() {
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

    stopVoiceBtn.addEventListener("click", function() {

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

    });

}


// ==========================================
// CLEAR CHAT HISTORY
// ==========================================

if (clearChatBtn) {

    clearChatBtn.addEventListener("click", function() {

        if (!chatBox) return;

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        chatHistory = [welcomeMessage];

        saveChatHistory();

        loadChatHistory();

        if (userInput) {
            userInput.value = "";
        }

    });

}


// ==========================================
// CONSOLE
// ==========================================

console.log("Suman Official loaded successfully!");
console.log("Suman AI Chat History enabled!");
