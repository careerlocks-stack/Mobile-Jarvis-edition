// ==========================================
// J.A.R.V.I.S — MOBILE AI ASSISTANT
// ==========================================

// Your Gemini API key
const API_KEY = "AQ.Ab8RN6KqfKQK9U7ECqF1bb4JilTL6pCIr_H7soQEUsSeWtGQ2A";

// Current Gemini model
const MODEL = "gemini-3.8-flash";

// ==========================================
// HTML ELEMENTS
// ==========================================

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.getElementById("voiceStatus");

// ==========================================
// SEND TEXT MESSAGE
// ==========================================

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

async function sendMessage() {

    const message = input.value.trim();

    if (!message) return;

    if (!API_KEY || API_KEY.includes("PASTE_YOUR")) {
        addMessage(
            "SYSTEM",
            "Gemini API key is not configured.",
            "ai"
        );
        return;
    }

    // User message
    addMessage("YOU", message, "user");

    input.value = "";

    // Thinking message
    addMessage(
        "J.A.R.V.I.S",
        "Thinking...",
        "ai"
    );

    try {

        const reply = await callGemini(message);

        removeThinking();

        addMessage(
            "J.A.R.V.I.S",
            reply,
            "ai"
        );

        // Speak response
        speak(reply);

    } catch (error) {

        console.error("JARVIS ERROR:", error);

        removeThinking();

        addMessage(
            "SYSTEM",
            "Connection error: " + error.message,
            "ai"
        );
    }
}

// ==========================================
// GEMINI API
// ==========================================

async function callGemini(message) {

    const url =
        "https://generativelanguage.googleapis.com/v1beta/models/" +
        MODEL +
        ":generateContent?key=" +
        encodeURIComponent(API_KEY);

    const prompt = `
You are J.A.R.V.I.S, a futuristic personal AI assistant.

Your personality:
- Intelligent
- Calm
- Helpful
- Natural
- Professional
- Slightly futuristic

Always address the user as "Boss" when appropriate.

Keep answers concise unless the user asks for detailed information.

User message:
${message}
`;

    const response = await fetch(url, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ]

        })

    });

    const data = await response.json();

    console.log("Gemini response:", data);

    if (!response.ok) {

        throw new Error(
            data?.error?.message ||
            "Gemini API request failed."
        );
    }

    const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {

        throw new Error(
            "Gemini returned no response."
        );
    }

    return reply;
}

// ==========================================
// ADD MESSAGE
// ==========================================

function addMessage(sender, text, type) {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        "msg " + type;

    const label =
        document.createElement("span");

    label.className = "label";

    label.textContent = sender;

    const textNode =
        document.createElement("div");

    textNode.textContent = text;

    messageDiv.appendChild(label);

    messageDiv.appendChild(textNode);

    chat.appendChild(messageDiv);

    chat.scrollTop =
        chat.scrollHeight;
}

// ==========================================
// REMOVE THINKING MESSAGE
// ==========================================

function removeThinking() {

    const messages =
        chat.querySelectorAll(".msg");

    if (messages.length === 0) return;

    const last =
        messages[messages.length - 1];

    if (
        last.classList.contains("ai") &&
        last.textContent.includes("Thinking...")
    ) {

        last.remove();
    }
}

// ==========================================
// VOICE RECOGNITION
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {

    const recognition =
        new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;

    voiceBtn.addEventListener(
        "click",
        function () {

            try {

                recognition.start();

                voiceStatus.textContent =
                    "LISTENING";

                voiceBtn.textContent =
                    "🎙 LISTENING...";

            } catch (error) {

                console.log(error);
            }
        }
    );

    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0].transcript;

            input.value = transcript;

            voiceStatus.textContent =
                "PROCESSING";

            voiceBtn.textContent =
                "🎙 PROCESSING...";

            sendMessage();
        };

    recognition.onend =
        function () {

            voiceStatus.textContent =
                "READY";

            voiceBtn.textContent =
                "🎙 START VOICE";
        };

    recognition.onerror =
        function (event) {

            console.error(
                "Voice error:",
                event.error
            );

            voiceStatus.textContent =
                "ERROR";

            voiceBtn.textContent =
                "🎙 START VOICE";
        };

} else {

    voiceStatus.textContent =
        "NOT SUPPORTED";

    voiceBtn.textContent =
        "🎙 VOICE NOT SUPPORTED";
}

// ==========================================
// TEXT TO SPEECH
// ==========================================

function speak(text) {

    if (!("speechSynthesis" in window)) {

        console.log(
            "Speech synthesis not supported."
        );

        return;
    }

    speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "en-IN";

    speech.rate = 0.95;

    speech.pitch = 0.9;

    speech.volume = 1;

    speechSynthesis.speak(speech);
}

// ==========================================
// STARTUP MESSAGE
// ==========================================

console.log(
    "J.A.R.V.I.S SYSTEM INITIALIZED."
);
