// api/edit-image.js

import fetch from 'node-fetch'; // Vercel Node.js 18+ ile fetch zaten var, eski sürümlerde node-fetch gerekebilir

export const config = {
  api: {
    bodyParser: false, // formData ile dosya alabilmek için
  },
};

import formidable from 'formidable';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Form verisini oku
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Form parsing error' });
      }

      const prompt = fields.prompt;
      const originalFile = files.image; // HTML tarafında 'image'
      const maskFile = files.mask;      // HTML tarafında 'mask'

      if (!prompt || !originalFile || !maskFile) {
        return res.status(400).json({ error: 'Eksik alan var' });
      }

      // OpenAI API key
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'API key tanımlı değil' });
      }

      // FormData hazırlama
      const formData = new FormData();
      formData.append('image', await fs.promises.readFile(originalFile.filepath), 'original.png');
      formData.append('mask', await fs.promises.readFile(maskFile.filepath), 'mask.png');
      formData.append('prompt', prompt);
      formData.append('n', '1');
      formData.append('size', '512x512');

      // OpenAI image edits API çağrısı
      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(500).json({ error: data.error?.message || 'Unknown error' });
      }

      // İlk resmi döndür
      return res.status(200).json({ url: data.data[0].url });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
