import { Configuration, OpenAIApi } from "openai";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "API key missing" });
  }

  try {
    // Formidable import ve form oluşturma
    const formidableModule = await import("formidable");
    const formidable = formidableModule.default || formidableModule;
    const form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Form parse error" });

      const prompt = fields.prompt;
      const originalFile = files.image;
      const maskFile = files.mask;

      if (!prompt || !originalFile) {
        return res.status(400).json({ error: "Missing prompt or image" });
      }

      const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
      const openai = new OpenAIApi(configuration);

      try {
        const imageResponse = await openai.images.edit({
          image: originalFile.filepath || originalFile[0].filepath,
          mask: maskFile?.filepath || maskFile?.[0]?.filepath,
          prompt,
          n: 1,
          size: "256x256", // Orta kalite için 256x256
        });

        res.status(200).json({ url: imageResponse.data.data[0].url });
      } catch (aiError) {
        console.error(aiError);
        res.status(500).json({ error: aiError.message || "OpenAI API error" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Unknown server error" });
  }
}
