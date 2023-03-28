import axios from 'axios';

const API_BASE_URL = 'https://generative.xyz/generative/api/developer';
const API_KEY = process.env.GENERATIVE_API_KEY;

export default async function handler(req, res) {
  const url = `${API_BASE_URL}/inscribe?api-key=${API_KEY}`;

  const walletAddress = req.body.walletAddress;
  const fileName = "photo.jpeg";
  const feeRate = 10;
  const fileData = "data:image/jpeg;base64,/9j/4AAvh//Z"  //req.body.file_base64 || "/9j/4AAvh//Z";

  try {
    const response = await axios.post(url, {
      walletAddress: "bc1p2jcpjsd6z4j63z3shes6phw3dhsu6dlfcesk7p6mfhjhchkzu7as9kauy3",//walletAddress,
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

