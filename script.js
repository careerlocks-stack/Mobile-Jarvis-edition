// ==========================================
// J.A.R.V.I.S — MOBILE AI ASSISTANT
// SECURE GEMINI BACKEND + VOICE
// ==========================================

const BACKEND_URL =
    "https://mobile-jarvis-edition.vercel.app/api/chat";

// ==========================================
// HTML ELEMENTS
// ==========================================

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.getElementById("voiceStatus");

// ==========================================
// TEXT MESSAGE EVENTS
// ==========================================

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {

    const message = input.value.trim();

    if (!message) return;

    addMessage("YOU", message, "user");

    input.value = "";

    addMessage(
        "J.A.R.V.I.S",
        "Thinking...",
        "ai"
    );

    sendBtn.disabled = true;

    try {

        const reply = await callJarvis(message);

        removeThinking();

        addMessage(
            "J.A.R.V.I.S",
            reply,
            "ai"
        );

        speak(reply);

    } catch (error) {

        console.error(
            "J.A.R.V.I.S ERROR:",
            error
        );

        removeThinking();

        addMessage(
            "SYSTEM",
            "Connection error: " +
            error.message,
            "ai"
        );

    } finally {

        sendBtn.disabled = false;
    }
}

// ==========================================
// SECURE BACKEND
// ==========================================

async function callJarvis(message) {

    const response = await fetch(
        BACKEND_URL,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })
        }
    );

    let data;

    try {

        data = await response.json();

    } catch {

        throw new Error(
            "Invalid response from J.A.R.V.I.S server."
        );
    }

    console.log(
        "J.A.R.V.I.S BACKEND:",
        data
    );

    if (!response.ok) {

        throw new Error(
            data?.error ||
            "Backend request failed."
        );
    }

    if (!data.reply) {

        throw new Error(
            "J.A.R.V.I.S returned no response."
        );
    }

    return data.reply;
}

// ==========================================
// ADD CHAT MESSAGE
// ==========================================

function addMessage(
    sender,
    text,
    type
) {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        "msg " + type;

    const label =
        document.createElement("span");

    label.className =
        "label";

    label.textContent =
        sender;

    const textNode =
        document.createElement("div");

    textNode.textContent =
        text;

    messageDiv.appendChild(
        label
    );

    messageDiv.appendChild(
        textNode
    );

    chat.appendChild(
        messageDiv
    );

    chat.scrollTop =
        chat.scrollHeight;
}

// ==========================================
// REMOVE THINKING
// ==========================================

function removeThinking() {

    const messages =
        chat.querySelectorAll(".msg");

    if (!messages.length) {
        return;
    }

    const last =
        messages[
            messages.length - 1
        ];

    if (
        last.classList.contains("ai") &&
        last.textContent.includes(
            "Thinking..."
        )
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

let recognition = null;

if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();

    recognition.lang =
        "en-IN";

    recognition.continuous =
        false;

    recognition.interimResults =
        false;

    recognition.maxAlternatives =
        1;

    voiceBtn.addEventListener(
        "click",
        startListening
    );

    function startListening() {

        try {

            recognition.start();

            voiceStatus.textContent =
                "LISTENING";

            voiceBtn.textContent =
                "🎙 LISTENING...";

        } catch (error) {

            console.log(
                "Voice start:",
                error
            );
        }
    }

    recognition.onresult =
        function (event) {

            const transcript =
                event
                .results[0][0]
                .transcript;

            console.log(
                "Boss said:",
                transcript
            );

            input.value =
                transcript;

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
                "VOICE ERROR:",
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
// J.A.R.V.I.S TEXT TO SPEECH
// ==========================================

let availableVoices = [];

function loadVoices() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }

    availableVoices =
        speechSynthesis.getVoices();
}

loadVoices();

if (
    "speechSynthesis" in window
) {

    speechSynthesis.onvoiceschanged =
        loadVoices;
}

// ==========================================
// SPEAK RESPONSE
// ==========================================

function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        console.log(
            "Speech synthesis unavailable."
        );

        return;
    }

    speechSynthesis.cancel();

    const cleanText =
        text
        .replace(/\*/g, "")
        .replace(/#/g, "")
        .replace(/`/g, "")
        .replace(/\n+/g, " ");

    const utterance =
        new SpeechSynthesisUtterance(
            cleanText
        );

    utterance.lang =
        "en-IN";

    utterance.rate =
        0.92;

    utterance.pitch =
        0.85;

    utterance.volume =
        1.0;

    let selectedVoice =
        availableVoices.find(
            voice =>
                voice.lang === "en-IN"
        );

    if (!selectedVoice) {

        selectedVoice =
            availableVoices.find(
                voice =>
                    voice.lang
                    .toLowerCase()
                    .startsWith("en")
            );
    }

    if (selectedVoice) {

        utterance.voice =
            selectedVoice;

        console.log(
            "J.A.R.V.I.S VOICE:",
            selectedVoice.name
        );
    }

    speechSynthesis.speak(
        utterance
    );
}

// ==========================================
// STARTUP
// ==========================================

console.log(
    "================================"
);

console.log(
    "J.A.R.V.I.S SYSTEM ONLINE"
);

console.log(
    "SECURE BACKEND:",
    BACKEND_URL
);

console.log(
    "VOICE SYSTEM READY"
);

console.log(
    "GEMINI API KEY: SERVER SIDE"
);

console.log(
    "================================"
);
