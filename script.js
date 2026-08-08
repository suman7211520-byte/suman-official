// ==========================================
// SUMAN OFFICIAL - MAIN SCRIPT
// ==========================================


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

const typingElement =
    document.getElementById("typing");


function typeEffect() {

    if (!typingElement) return;

    const currentWord =
        words[wordIndex];


    if (!deleting) {

        typingElement.textContent =
            currentWord.substring(
                0,
                charIndex + 1
            );

        charIndex++;


        if (
            charIndex ===
            currentWord.length
        ) {

            deleting = true;

            setTimeout(
                typeEffect,
                1200
            );

            return;
        }


    } else {

        typingElement.textContent =
            currentWord.substring(
                0,
                charIndex - 1
            );

        charIndex--;


        if (charIndex === 0) {

            deleting = false;

            wordIndex =
                (wordIndex + 1)
                % words.length;
        }
    }


    setTimeout(
        typeEffect,
        deleting ? 60 : 120
    );
}


typeEffect();



// ==========================================
// DARK / LIGHT MODE
// ==========================================

const darkModeBtn =
    document.getElementById(
        "darkModeBtn"
    );


if (darkModeBtn) {

    darkModeBtn.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "light"
            );


            if (
                document.body.classList.contains(
                    "light"
                )
            ) {

                darkModeBtn.textContent =
                    "🌙";

            } else {

                darkModeBtn.textContent =
                    "☀️";
            }

        }
    );
}



// ==========================================
// SUMAN AI CHAT
// ==========================================

const chatBox =
    document.getElementById(
        "chatBox"
    );

const userInput =
    document.getElementById(
        "userInput"
    );

const sendBtn =
    document.getElementById(
        "sendBtn"
    );



// ==========================================
// ADD MESSAGE
// ==========================================

function addMessage(
    message,
    type
) {

    if (!chatBox) return;


    const div =
        document.createElement(
            "div"
        );


    div.className =
        type === "user"
            ? "user-message"
            : "ai-message";


    const strong =
        document.createElement(
            "strong"
        );


    strong.textContent =
        type === "user"
            ? "You: "
            : "Suman AI: ";


    div.appendChild(strong);


    const text =
        document.createTextNode(
            message
        );


    div.appendChild(text);


    chatBox.appendChild(div);


    chatBox.scrollTop =
        chatBox.scrollHeight;
}



// ==========================================
// SEND MESSAGE TO VERCEL API
// ==========================================

async function sendMessage() {

    if (
        !userInput ||
        !chatBox
    ) {
        return;
    }


    const message =
        userInput.value.trim();


    if (!message) {
        return;
    }


    // User message
    addMessage(
        message,
        "user"
    );


    // Clear input
    userInput.value = "";


    // Disable button
    if (sendBtn) {
        sendBtn.disabled = true;
    }


    // Thinking message
    const thinking =
        document.createElement(
            "div"
        );


    thinking.className =
        "ai-message";


    thinking.innerHTML =
        "<strong>Suman AI:</strong> Thinking... 🤔";


    chatBox.appendChild(
        thinking
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;


    try {

        const response =
            await fetch(
                "/api/chat",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message:
                                message
                        })
                }
            );


        const data =
            await response.json();


        // Remove Thinking
        thinking.remove();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "AI request failed"
            );
        }


        const answer =
            data.answer ||
            "Sorry, I could not generate a response.";


        addMessage(
            answer,
            "ai"
        );


    } catch (error) {

        console.error(
            "Suman AI Error:",
            error
        );


        thinking.remove();


        addMessage(
            "Sorry! Suman AI এখন উত্তর দিতে পারছে না. 🤖 Please try again.",
            "ai"
        );

    }


    // Enable button
    if (sendBtn) {
        sendBtn.disabled = false;
    }


    userInput.focus();
}



// ==========================================
// SEND BUTTON
// ==========================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}



// ==========================================
// ENTER KEY
// ==========================================

if (userInput) {

    userInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                sendMessage();
            }

        }
    );

}
// ==========================================
// SUMAN AI - VOICE INPUT
// ==========================================

const voiceBtn =
    document.getElementById("voiceBtn");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (voiceBtn && SpeechRecognition) {

    const recognition =
        new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;


    voiceBtn.addEventListener(
        "click",
        function () {

            recognition.start();

            voiceBtn.textContent = "🔴";

        }
    );


    recognition.onresult =
        function (event) {

            const text =
                event.results[0][0].transcript;

            if (userInput) {
                userInput.value = text;
            }

            voiceBtn.textContent = "🎤";

        };


    recognition.onerror =
        function () {

            voiceBtn.textContent = "🎤";

        };


    recognition.onend =
        function () {

            voiceBtn.textContent = "🎤";

        };

} else if (voiceBtn) {

    voiceBtn.disabled = true;

    voiceBtn.textContent = "❌";

}


// ==========================================
// CONSOLE
// ==========================================

console.log(
    "Suman Official loaded successfully!"
);

console.log(
    "Suman AI is ready!"
);
// ==========================================
// SUMAN AI - VOICE OUTPUT
// ==========================================

function speakAI(text) {

    if (!("speechSynthesis" in window)) {
        console.log("Voice output is not supported.");
        return;
    }

    // Remove any unwanted HTML
    const cleanText = text.replace(/<[^>]*>/g, "");

    const speech = new SpeechSynthesisUtterance(cleanText);

    speech.lang = "en-IN";
    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
}
