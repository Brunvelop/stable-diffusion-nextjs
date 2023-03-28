export const generateImage = async (prompt) => {
    try {
      const response = await fetch("/api/diffusion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
  
      const data = await response.json();
      return data.modelOutputs[0].image_base64;
    } catch (error) {
      throw new Error("Error generating image");
    }
  };
  
  export const inscribeImage = async (address, image) => {
    try {
      const response = await fetch("/api/inscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: address, fileBase64: image }),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error("Error inscribing image");
    }
  };