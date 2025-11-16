import { Configuration, OpenAIApi } from "openai";

// Body parser kapalı, Formidable kullanacağız
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
    // Formidable import
    const formidable = (await import("formidable")).default;
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ error: "Form parse error" });
      }

      const prompt = fields.prompt;
      const originalFile = files.image;
      const maskFile = files.mask;

      if (!prompt || !originalFile) {
        return res.status(400).json({ error: "Missing prompt or image file" });
      }

      // OpenAI ayarları
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

        if (!imageResponse?.data?.data?.[0]?.url) {
          return res.status(500).json({ error: "OpenAI returned no image URL" });
        }

        return res.status(200).json({ url: imageResponse.data.data[0].url });
      } catch (apiError) {
        console.error("OpenAI API error:", apiError);
        return res.status(500).json({ error: apiError.message || "OpenAI API error" });
      }
    });

  } catch (error) {
    console.error("Unexpected server error:", error);
    return res.status(500).json({ error: error.message || "Unknown server error" });
  }
}
