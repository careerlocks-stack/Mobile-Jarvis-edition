export default async function handler(req, res) {

    // CORS
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    // Handle browser preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only POST is allowed
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { message } = req.body || {};

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const apiKey =
            process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error:
                    "Gemini API key is not configured"
            });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "x-goog-api-key":
                        apiKey
                },

                body: JSON.stringify({

                    contents: [
                        {
                            parts: [
                                {
                                    text: `
You are J.A.R.V.I.S, a futuristic personal AI assistant.

Personality:
- Intelligent
- Calm
- Professional
- Helpful
- Natural
- Futuristic

Always address the user as "Boss".

Give clear and useful answers.
Keep answers concise unless Boss asks for details.

User message:
${message}
`
                                }
                            ]
                        }
                    ]

                })
            }
        );

        const data =
            await response.json();

        console.log(
            "Gemini response:",
            data
        );

        if (!response.ok) {

            return res.status(
                response.status
            ).json({
                error:
                    data?.error?.message ||
                    "Gemini API request failed"
            });
        }

        const reply =
            data
                ?.candidates?.[0]
                ?.content?.parts?.[0]
                ?.text;

        if (!reply) {

            return res.status(500).json({
                error:
                    "No response received from Gemini"
            });
        }

        return res.status(200).json({
            reply: reply
        });

    } catch (error) {

        console.error(
            "JARVIS backend error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}
