import axios from "axios";

const API_BASE_URL = "https://generative.xyz/generative/api/developer";
const API_KEY = process.env.GENERATIVE_API_KEY;
const FEES_API_URL = "https://mempool.space/api/v1/fees/recommended";

// Helper function to get recommended fee rate
async function getRecommendedFee() {
  try {
    const response = await axios.get(FEES_API_URL);
    return response.data.halfHourFee;
  } catch (error) {
    console.error("Error fetching recommended fee:", error);
    return null;
  }
}

// Helper function to create payment address
async function createInscription(walletAddress, fileName, feeRate, fileData) {
  const url = `${API_BASE_URL}/inscribe?api-key=${API_KEY}`;

  const response = await axios.post(
    url,
    {
      walletAddress,
      fileName,
      feeRate,
      file: fileData,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    }
  );

  return response.data;
}

// Main function to handle requests and responses
export default async function handler(req, res) {
  try {
    // Get wallet address and file data from request body
    const walletAddress = req.body.walletAddress;
    const fileBase64 = req.body.fileBase64;

    // Validate input
    if (!walletAddress || !fileBase64) {
      res
        .status(400)
        .json({ error: "Missing wallet address or file data in the request body" });
      return;
    }

    // Set constants
    const fileName = "photo.jpeg";
    const recommendedFee = await getRecommendedFee();
    const feeRate = recommendedFee || 15;
    const fileData = `data:image/jpeg;base64,${fileBase64}`;

    const data = await createInscription(walletAddress, fileName, feeRate, fileData);

    // Send payment address data as JSON response
    res.status(200).json(data);
  } catch (error) {
    // Handle errors and exceptions
    console.error("Error getting payment address:", error);
    res.status(error.response?.status || 500).json({ message: error.message });
  }
}