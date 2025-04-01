// Huggingface model
// import { HUGGINGFACE_API_KEY } from '@env';

// const HF_MODEL = 'digit82/kobart-summarization';

// export async function summarizeText(text) {
//   try {
//     const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ inputs: text }),
//     });

//     const data = await response.json();
//     console.log('HuggingFace 응답:', data);

//     if (data.error) {
//       console.error('HuggingFace 오류:', data.error);
//       return '(요약 실패)';
//     }

//     return data[0]?.summary_text || data[0]?.generated_text || '(요약 결과 없음)';
//   } catch (error) {
//     console.error('HuggingFace API 호출 에러:', error);
//     return '(요약 중 오류 발생)';
//   }
// }


// open ai model
// 📁 utils/summarizeText.js
import { OPENAI_API_KEY } from '@env';

export async function summarizeText(text) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `당신은 사용자가 작성한 하루의 일기를 정리해주는 요약 비서입니다. 사용자의 글을 바탕으로 자연스러운 한 문장으로 요약해주세요. 반드시 1인칭 시점으로 쓰되, 구어체가 아닌 서술형으로 "오늘 ~했다"와 같은 문장으로 작성해주세요.`,
          },
          {
            role: 'user',
            content: `다음 일기를 요약해줘:\n${text}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const json = await response.json();
    console.log('GPT 요약 응답:', json);

    const summary = json.choices?.[0]?.message?.content;
    return summary || '(요약 실패)';
  } catch (error) {
    console.error('OpenAI 요약 에러:', error);
    return '(요약 중 오류 발생)';
  }
}