import OpenAI from "openai";


const llmService = async (openai: OpenAI, prompt: string) => {

  const response = await openai.chat.completions.create(
    {
     messages: [{role: "system", content: 'you are a helpful assistant.'},{role: "user", content: prompt}],
     model: "gpt-3.5-turbo",
    }
  );
    return response.choices[0].message.content || '';
}

export { llmService };