import axios from "axios";

const callService = async (requestData:any) => {
  const prompt = requestData.prompt;
  const response = await axios.post(
    "https://api.openai.com/v1/completions",
    {
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0.9,
      max_tokens: 521,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [" Human:", " AI:"],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(process.env.OPENAI_API_KEY),
      },
    },
  );
    return response.data.choices[0].text.data;
}

export { callService };