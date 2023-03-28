import * as banana from "@banana-dev/banana-dev";

// Load Banana API keys from environment variables
const apiKey = process.env.BANANA_API_KEY;
const modelKey = process.env.BANANA_MODEL_KEY;

// Helper function to run Banana model
async function runBananaModel(prompt, height = 64, width = 64, steps = 20) {
  const modelParameters = {
    prompt,
    height,
    width,
    steps,
  };

  return await banana.run(apiKey, modelKey, modelParameters);
}

// Main function to handle requests and responses
export default async function (req, res) {
  try {
    // Get prompt from request body
    const prompt = req.body.prompt;

    // Validate input
    if (!prompt) {
      res.status(400).json({ error: "Missing prompt in the request body" });
      return;
    }

    // Run model and get output
    const output = await runBananaModel(prompt);

    // Send output as JSON response
    res.status(200).json(output);
  } catch (error) {
    // Handle errors and exceptions
    console.error("Error running Banana model:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}