export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${process.env.OPENROUTER_API_KEY}`,

                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    model: "openrouter/free",

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are Suman AI, a helpful personal AI assistant. Reply clearly and politely. You can answer in Bengali or English depending on the user's language."
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

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || "AI API error"
            });
        }

        const answer =
            data.choices?.[0]?.message?.content ||
            "Sorry, I could not generate a response.";

        return res.status(200).json({
            answer: answer
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}
