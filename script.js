const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const send = document.getElementById("send");
const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.getElementById("voiceStatus");


// =================================================
// GEMINI API KEY
// TESTING ONLY — DON'T PUT A REAL KEY IN PUBLIC GITHUB
// =================================================

const API_KEY = "AQ.Ab8RN6LBQWeSaBhysrhWJ2cEkKsSFz7k0QlzPEWERNPypNi_NA";


// =================================================
// SEND MESSAGE
// =================================================

send.addEventListener("click", askJarvis);

input.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        askJarvis();
    }

});


async function askJarvis() {

    const message = input.value.trim();

    if (!message) return;

    addMessage(message, "user");

    input.value = "";

    const thinking = addMessage(
        "Thinking...",
        "ai"
    );

    send.disabled = true;

    try {

        const url =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key="
            + encodeURIComponent(API_KEY);


        const response = await fetch(url, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                contents: [

                    {
                        role: "user",

                        parts: [

                            {
                                text:
                                "You are J.A.R.V.I.S, a futuristic personal AI assistant. " +
                                "Address the user as Boss. " +
                                "Be helpful, concise and natural.\n\n" +
                                "User: " + message
                            }

                        ]
                    }

                ]

            })

        });


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error?.message ||
                "Gemini API error"
            );

        }


        const answer =
            data.candidates?.[0]?.content?.parts?.[0]?.text;


        if (!answer) {

            throw new Error(
                "No response received from Gemini."
            );

        }


        thinking.innerText = answer;

        speak(answer);

    }

    catch (error) {

        console.error(error);

        thinking.innerText =
            "J.A.R.V.I.S ERROR: " +
            error.message;

    }

    finally {

        send.disabled = false;

        input.focus();

    }

}


// =================================================
// ADD MESSAGE
// =================================================

function addMessage(text, type) {

    const div = document.createElement("div");

    div.className =
        "msg " + type;

    if (type === "ai") {

        div.innerHTML =
            '<span class="label">J.A.R.V.I.S</span>' +
            escapeHTML(text);

    } else {

        div.innerText =
            "YOU: " + text;

    }

    chat.appendChild(div);

    chat.scrollTop =
        chat.scrollHeight;

    return div;

}


// =================================================
// PROTECT CHAT HTML
// =================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.innerText = text;

    return div.innerHTML;

}


// =================================================
// VOICE INPUT
// =================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";


    recognition.onstart = function() {

        voiceBtn.innerText =
            "🔴 LISTENING...";

        voiceStatus.innerText =
            "LISTENING";

        voiceStatus.className =
            "green";

    };


    recognition.onresult = function(event) {

        const text =
            event.results[0][0].transcript;

        input.value = text;

        voiceBtn.innerText =
            "🎙 START VOICE";

        voiceStatus.innerText =
            "READY";

        askJarvis();

    };


    recognition.onerror = function(event) {

        voiceBtn.innerText =
            "🎙 START VOICE";

        voiceStatus.innerText =
            "VOICE ERROR";

        console.log(event.error);

    };


    recognition.onend = function() {

        voiceBtn.innerText =
            "🎙 START VOICE";

    };

}


voiceBtn.addEventListener("click", function() {

    if (!recognition) {

        alert(
            "Voice recognition is not supported in this browser."
        );

        return;

    }

    recognition.start();

});


// =================================================
// J.A.R.V.I.S VOICE OUTPUT
// =================================================

function speak(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.rate = 0.95;
    speech.pitch = 0.8;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);

}
