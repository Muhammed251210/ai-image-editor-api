export default async function handler(req, res) {
    try {
        const { prompt, imageBase64, maskBase64 } = JSON.parse(req.body);

        const apiRes = await fetch("https://api.openai.com/v1/images/edits", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                prompt,
                image: imageBase64,
                mask: maskBase64,
                size: "1024x1024"
            })
        });

        const data = await apiRes.json();
        res.status(200).json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
