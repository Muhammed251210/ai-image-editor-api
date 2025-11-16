import { IncomingForm } from "formidable";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: "API key missing" });

  try {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Form parse error" });

      const prompt = fields.prompt;
      const originalFile = files.image;
      const maskFile = files.mask;

      if (!prompt || !originalFile) return res.status(400).json({ error: "Missing prompt or image" });

      const { Configuration, OpenAIApi } = await import("openai");
      const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
      const openai = new OpenAIApi(configuration);

      try {
        const imageResponse = await openai.images.edit({
          image: originalFile.filepath,
          mask: maskFile?.filepath,
          prompt,
          n: 1,
          size: "512x512"
        });

        res.status(200).json({ url: imageResponse.data.data[0].url });
      } catch (apiError) {
        console.error("OpenAI API error:", apiError);
        res.status(500).json({ error: apiError.message || "OpenAI API error" });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: error.message || "Unknown server error" });
  }
}
