// ===============================
// J.A.R.V.I.S CORE
// ===============================

const API_KEY = "AQ.Ab8RN6LBQWeSaBhysrhWJ2cEkKsSFz7k0QlzPEWERNPypNi_NA";
const MODEL = "gemini-3.8-flash";

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.getElementById("voiceStatus");


// ===============================
// SEND MESSAGE
// ===============================

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});


async function sendMessage() {

    const message = input.value.trim();

    if (!message) return;

    // Show user message
    addMessage("YOU", message, "user");

    input.value = "";

    // Thinking message
    addMessage("J.A.R.V.I.S", "Thinking...", "ai");

    try {

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/" +
            MODEL +
            ":generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": API_KEY
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text:
                                    `You are J.A.R.V.I.S, a futuristic personal AI assistant.

Address the user respectfully as Boss.

Be helpful, intelligent, concise and natural.

User message:
${message}`
                                }
                            ]
                        }
                    ]
                })
            }
        );


        const data = await response.json();

        console.log("Gemini response:", data);


        if (!response.ok) {

            throw new Error(
                data?.error?.message ||
                "Gemini API request failed"
            );
        }


        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;


        if (!reply) {
            throw new Error("No response received from Gemini.");
        }


        // Remove Thinking message
        removeLastAIMessage();

        // Show AI response
        addMessage("J.A.R.V.I.S", reply, "ai");

        // Speak response
        speak(reply);

    }

    catch (error) {

        console.error(error);

        removeLastAIMessage();

        addMessage(
            "SYSTEM",
            "Connection error: " + error.message,
            "ai"
        );
    }
}


// ===============================
// CHAT MESSAGE
// ===============================

function addMessage(sender, text, type) {

    const messageDiv = document.createElement("div");

    messageDiv.className = "msg " + type;

    const label = document.createElement("span");

    label.className = "label";

    label.textContent = sender;

    messageDiv.appendChild(label);

    const textNode = document.createElement("div");

    textNode.textContent = text;

    messageDiv.appendChild(textNode);

    chat.appendChild(messageDiv);

    chat.scrollTop = chat.scrollHeight;
}


// ===============================
// REMOVE THINKING MESSAGE
// ===============================

function removeLastAIMessage() {

    const messages = chat.querySelectorAll(".msg");

    if (messages.length === 0) return;

    const last = messages[messages.length - 1];

    if (
        last.classList.contains("ai") &&
        last.textContent.includes("Thinking...")
    ) {
        last.remove();
    }
}


// ===============================
// VOICE INPUT
// ===============================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;


    voiceBtn.addEventListener("click", function () {

        try {

            recognition.start();

            voiceStatus.textContent = "LISTENING";

            voiceBtn.textContent = "🎙 LISTENING...";

        }

        catch (error) {

            console.log(error);

        }

    });


    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript;

        input.value = transcript;

        voiceStatus.textContent = "READY";

        voiceBtn.textContent = "🎙 START VOICE";

        // Automatically send
        sendMessage();

    };


    recognition.onend = function () {

        voiceStatus.textContent = "READY";

        voiceBtn.textContent = "🎙 START VOICE";

    };


    recognition.onerror = function (event) {

        console.error("Voice error:", event.error);

        voiceStatus.textContent = "ERROR";

        voiceBtn.textContent = "🎙 START VOICE";

    };

}
else {

    voiceStatus.textContent = "NOT SUPPORTED";

    voiceBtn.textContent = "🎙 VOICE NOT SUPPORTED";

}


// ===============================
// J.A.R.V.I.S VOICE OUTPUT
// ===============================

function speak(text) {

    if (!("speechSynthesis" in window)) {
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
