import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import { uploadToPinata } from '../services/pinataService.js';
import { savePinData } from '../controllers/pinController.js';

const router = express.Router();

router.post('/upload-to-pinata', (req, res) => {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const fileStream = fs.createReadStream(file.filepath);
      const pinataResult = await uploadToPinata(fileStream, file.originalFilename);
      const dbResult = await savePinData(fields, pinataResult);

      return res.status(200).json({
        success: true,
        ipfsUrl: pinataResult.ipfsUrl,
        dbResult,
      });
    } catch (uploadError) {
      console.error('Upload or DB Save Failed:', uploadError);
      return res.status(500).json({ error: 'Upload to Pinata or saving data failed' });
    }
  });
});

export default router;
