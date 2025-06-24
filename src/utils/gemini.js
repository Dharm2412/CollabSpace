const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function getAIResponse(message) {
  try {
    const response = await fetch(
      `${API_URL}?key=AIzaSyB5LjHte97UTbIkcGyu-pWvMcdv82HiCwM`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    if (data.candidates && data.candidates[0]) {
      return data.candidates[0].content.parts[0].text;
    }
    throw new Error("Invalid API response");
  } catch (error) {
    console.error("AI Error:", error);
    return "Sorry, I'm having trouble understanding right now. Please try again.";
  }
}

// New function specifically for code generation
export async function generateCode(prompt, language = "javascript") {
  try {
    const codePrompt = `Generate ${language} code for: ${prompt}. 
    Please provide only the code without explanations, wrapped in \`\`\`${language} code blocks.
    Make sure the code is functional and well-formatted.`;
    
    const response = await fetch(
      `${API_URL}?key=AIzaSyB5LjHte97UTbIkcGyu-pWvMcdv82HiCwM`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: codePrompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    if (data.candidates && data.candidates[0]) {
      return data.candidates[0].content.parts[0].text;
    }
    throw new Error("Invalid API response");
  } catch (error) {
    console.error("Code Generation Error:", error);
    return "Sorry, I'm having trouble generating code right now. Please try again.";
  }
}
