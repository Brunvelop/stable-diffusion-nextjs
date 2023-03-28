import axios from 'axios';

const API_BASE_URL = 'https://generative.xyz/generative/api/developer';
const API_KEY = process.env.GENERATIVE_API_KEY;

export default async function handler(req, res) {
  const url = `${API_BASE_URL}/inscribe?api-key=${API_KEY}`;

  const walletAddress = req.body.walletAddress;
  const fileName = "photo.jpeg";
  const feeRate = 15;
  const fileData = "data:image/jpeg;base64,"+req.body.fileBase64;

  try {
    const response = await axios.post(url, {
      walletAddress: walletAddress,
      fileName:fileName,
      feeRate:feeRate,
      file: fileData,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    res.status(200).json(response.data);

  } catch (error) {
    console.error('Error getting payment address:', error);
    res.status(error.response.status || 500).json({ message: error.message });
  }
}

