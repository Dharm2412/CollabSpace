const GEMINI_API_KEY = "AIzaSyCkHGKF1hlvt5ihNXavqny9RBmUDBGDvvk";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function getAIResponse(message) {
  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: message
          }]
        }]
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0]) {
      return data.candidates[0].content.parts[0].text;
    }
    throw new Error('Invalid API response');
  } catch (error) {
    console.error('AI Error:', error);
    return "Sorry, I'm having trouble understanding right now. Please try again.";
  }
} 