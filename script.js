// ==========================================
// J.A.R.V.I.S — IRON MAN HUD SYSTEM
// SECURE GEMINI BACKEND + VOICE
// ==========================================

const BACKEND_URL =
    "https://mobile-jarvis-edition.vercel.app/api/chat";


// ==========================================
// HTML ELEMENTS
// ==========================================

const chat =
    document.getElementById("chat");

const input =
    document.getElementById("msg");

const sendBtn =
    document.getElementById("send");

const voiceBtn =
    document.getElementById("voiceBtn");

const voiceStatus =
    document.getElementById("voiceStatus");

const mainStatus =
    document.getElementById("mainStatus");


// ==========================================
// MESSAGE EVENTS
// ==========================================

sendBtn.addEventListener(
    "click",
    sendMessage
);

input.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            sendMessage();
        }

    }
);


// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {

    const message =
        input.value.trim();

    if (!message) return;


    addMessage(
        "BOSS",
        message,
        "user"
    );

    input.value = "";


    setThinking();


    try {

        const reply =
            await callJarvis(message);


        removeThinking();


        addMessage(
            "J.A.R.V.I.S",
            reply,
            "ai"
        );


        setSpeaking();

        speak(reply);

    }

    catch (error) {

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


        setReady();

    }

}


// ==========================================
// JARVIS BACKEND
// ==========================================

async function callJarvis(message) {

    const response =
        await fetch(
            BACKEND_URL,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        message: message
                    })

            }
        );


    let data;


    try {

        data =
            await response.json();

    }

    catch {

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
// THINKING STATE
// ==========================================

function setThinking() {

    mainStatus.textContent =
        "PROCESSING REQUEST";

    voiceStatus.textContent =
        "THINKING";

    voiceStatus.className =
        "yellow";


    addMessage(
        "J.A.R.V.I.S",
        "Analyzing your request...",
        "ai thinking-message"
    );

}


// ==========================================
// SPEAKING STATE
// ==========================================

function setSpeaking() {

    mainStatus.textContent =
        "SPEAKING";

    voiceStatus.textContent =
        "SPEAKING";

    voiceStatus.className =
        "green";

}


// ==========================================
// READY STATE
// ==========================================

function setReady() {

    mainStatus.textContent =
        "SYSTEM READY";

    voiceStatus.textContent =
        "READY";

    voiceStatus.className =
        "green";

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
        last.textContent.includes(
            "Analyzing your request..."
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


            mainStatus.textContent =
                "LISTENING";


            voiceStatus.className =
                "green";


            voiceBtn.textContent =
                "🎙 LISTENING...";


            voiceBtn.classList.add(
                "listening"
            );

        }

        catch (error) {

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
                "BOSS SAID:",
                transcript
            );


            input.value =
                transcript;


            voiceStatus.textContent =
                "PROCESSING";


            mainStatus.textContent =
                "PROCESSING";


            voiceBtn.textContent =
                "🎙 PROCESSING...";


            sendMessage();

        };


    recognition.onend =
        function () {

            voiceBtn.classList.remove(
                "listening"
            );


            if (
                mainStatus.textContent ===
                "LISTENING"
            ) {

                setReady();

            }


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


            mainStatus.textContent =
                "VOICE ERROR";


            voiceBtn.classList.remove(
                "listening"
            );


            voiceBtn.textContent =
                "🎙 START VOICE";


            setTimeout(
                setReady,
                1500
            );

        };

}

else {

    voiceStatus.textContent =
        "NOT SUPPORTED";

    mainStatus.textContent =
        "VOICE UNAVAILABLE";

    voiceBtn.textContent =
        "🎙 VOICE NOT SUPPORTED";

}


// ==========================================
// TEXT TO SPEECH
// ==========================================

let availableVoices = [];


function loadVoices() {

    if (
        !(
            "speechSynthesis"
            in window
        )
    ) {

        return;

    }


    availableVoices =
        speechSynthesis.getVoices();

}


loadVoices();


if (
    "speechSynthesis"
    in window
) {

    speechSynthesis.onvoiceschanged =
        loadVoices;

}


// ==========================================
// JARVIS SPEAK
// ==========================================

function speak(text) {

    if (
        !(
            "speechSynthesis"
            in window
        )
    ) {

        setReady();

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
                voice.lang ===
                "en-IN"
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


    utterance.onend =
        function () {

            setReady();

        };


    utterance.onerror =
        function () {

            setReady();

        };


    speechSynthesis.speak(
        utterance
    );

}


// ==========================================
// QUICK COMMANDS
// ==========================================

const quickButtons =
    document.querySelectorAll(
        ".quick-btn"
    );


quickButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                input.value =
                    button.dataset.command;

                sendMessage();

            }
        );

    }
);


// ==========================================
// STARTUP
// ==========================================

console.log(
    "================================"
);

console.log(
    "J.A.R.V.I.S HUD ONLINE"
);

console.log(
    "SECURE GEMINI BACKEND ACTIVE"
);

console.log(
    "VOICE ENGINE ACTIVE"
);

console.log(
    "ARC REACTOR ONLINE"
);

console.log(
    "SYSTEM STATUS: READY"
);

console.log(
    "================================"
);
