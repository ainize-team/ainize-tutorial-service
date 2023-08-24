import axios from "axios";

const callService = async (requestData:any) => {
  const prompt = requestData.prompt;
  const response = await axios.post(
    "https://api.openai.com/v1/completions",
    // docs복사 prompt에 내가 한 질문 입력
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
    // 발급받은 api키 env로 입력
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(process.env.OPENAI_API_KEY),
      },
    },
  );
    //DO SOMETHING
    return {
        status: 'SUCCESS',
        data: response.data.choices[0].text,
    };
}

export { callService };