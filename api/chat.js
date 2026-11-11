export default async function handler(req, res) {

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

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "API key is not configured in Vercel."
            });
        }

        // Previous conversation history
        const history = Array.isArray(req.body?.history)
            ? req.body.history
            : [];

        // Accept only valid user and AI messages
        const safeHistory = history
            .filter(item =>
                item &&
                ["user", "ai"].includes(item.type) &&
                typeof item.message === "string" &&
                item.message.trim()
            )
            .slice(-12)
            .map(item => ({
                role: item.type === "user" ? "user" : "assistant",
                content: item.message.trim().slice(0, 4000)
            }));

        const messages = [
            {
                role: "system",
                content:
                    "You are Suman AI, a helpful personal AI assistant created by Suman Samanta. Reply politely and clearly. Reply in Bengali when the user writes Bengali, and English when the user writes English. Use previous conversation messages to understand context."
            },
            ...safeHistory,
            {
                role: "user",
                content: message
            }
        ];

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
                    messages: messages
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenRouter Error:", data);

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

        console.error("Suman AI Server Error:", error);

        return res.status(500).json({
            error: "Server error."
        });
    }
}
