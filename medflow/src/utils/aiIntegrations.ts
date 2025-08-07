// AI Integration Point: This file centralizes AI calls so the UI can remain simple.
// Replace generateBotResponse with OpenAI/Claude API calls later.

export async function generateBotResponse(_userMessage: string): Promise<string> {
  // AI Integration Point: Replace this static response with an API call
  // to a language model (OpenAI, Claude, etc.), passing userMessage
  // and returning the model's response.
  await new Promise((r) => setTimeout(r, 400))
  return 'Am înțeles. Vă rog să detaliați durata, intensitatea și factorii agravanți/amelioranți ai simptomelor.'
}