import OpenAI from "openai";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const llmService = async (prompt: string) => {

  const response = await openai.chat.completions.create(
    {
     messages:[{role: "user", content: prompt}],
     model: "gpt-3.5-turbo",
    }
  );
    return response.choices[0].message.content || '';
}

export { llmService };