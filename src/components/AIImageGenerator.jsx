import React, { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const API_URL =
  "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev";

export default function AIImageGenerator({
  onImageGenerated,
  onGenerateStart,
  onProgress,
}) {
  const [prompt, setPrompt] = useState("Astronaut riding a horse");
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a valid prompt");
      return;
    }
    setIsLoading(true);
    setError("");
    onGenerateStart();
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_inference_steps: 25, // Higher quality
            width: 1920, // Full HD width
            height: 1080, // Full HD height
          },
        }),
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const result = await response.blob();
      const url = URL.createObjectURL(result);
      setImageUrl(url);
      onImageGenerated(url);
      toast.success("High-quality image generated!");
    } catch (error) {
      setError(error.message || "Failed to generate image");
      toast.error(error.message || "Failed to generate image");
    } finally {
      setIsLoading(false);
      onProgress(100);
    }
  };

  return (
    <motion.div className="p-4 bg-white rounded-lg shadow-md mx-4 mt-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        AI Image Generator
      </h2>
      <div className="space-y-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here"
          className="w-full px-3 py-2 mb-4 border rounded-md"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerateImage}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Generating..." : "Generate Image"}
        </button>
      </div>

      {imageUrl && (
        <motion.div className="mt-4">
          <div className="relative w-full max-w-xs mx-auto">
            <img
              src={imageUrl}
              alt="Generated AI"
              className="w-full h-48 object-cover rounded-md shadow-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-md"></div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
