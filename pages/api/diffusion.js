import * as banana from "@banana-dev/banana-dev";

const apiKey = process.env.BANANA_API_KEY;
const futureDiffusionKey = process.env.BANANA_MODEL_KEY_FUTURE_DIFFUSION;
const stableDiffusion21Key = process.env.BANANA_MODEL_KEY_STABLE_DIFFUSION_2_1;

async function runBananaModel(model, prompt, height = 64*6, width = 64*6, steps = 20) {
  let modelKey;
  switch (model) {
    case "future_diffusion":
      modelKey = futureDiffusionKey;
      break;
    case "stable_diffusion_2_1":
      modelKey = stableDiffusion21Key;
      break;
    default:
      throw new Error("Invalid model parameter");
  }

  const modelParameters = {
    prompt,
    height,
    width,
    steps,
  };

  return await banana.run(apiKey, modelKey, modelParameters);
}

export default async function (req, res) {
  try {
    const { prompt, model } = req.body;

    if (!prompt || !model) {
      res.status(400).json({ error: "Missing prompt or model in the request body" });
      return;
    }

    const output = await runBananaModel(model, prompt);

    res.status(200).json(output);
  } catch (error) {
    console.error("Error running Banana model:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}