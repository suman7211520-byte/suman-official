
export default async function handler(req, res) {

    // Only POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const message = req.body?.message?.trim();

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        // Check API Key
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            console.error("OPENROUTER_API_KEY is missing");

            return res.status(500).json({
                error: "API key is not configured in Vercel."
            });
        }

        // OpenRouter API
        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "X-Title": "Suman Official"
                },

                body: JSON.stringify({

                    model: "openrouter/free",

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are Suman AI, a helpful personal AI assistant created by Suman Samanta. Reply politely and clearly. Reply in Bengali when the user writes Bengali, and English when the user writes English."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        // API Error
        if (!response.ok) {

            console.error(
                "OpenRouter Error:",
                data
            );

            return res.status(502).json({
                error:
                    data.error?.message ||
                    `OpenRouter API returned status ${response.status}`
            });
        }

        const answer =
            data.choices?.[0]?.message?.content;

        if (!answer) {
            return res.status(502).json({
                error: "AI returned an empty response."
            });
        }

        return res.status(200).json({
            answer: answer
        });

    } catch (error) {

        console.error(
            "Suman AI Server Error:",
            error
        );

        return res.status(500).json({
            error: "Server error: " + error.message
        });
    }
}
