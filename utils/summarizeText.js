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
// 파일: utils/summarizeText.js
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
            content: `당신은 사용자가 작성한 하루의 일과를 일기로 요약해주세요. 반드시 1인칭 시점 문어체로 "오늘 누구와 어디에서 무엇을 했다."와 같은 문장으로 작성해주세요. 사용자가 구어체로 작성해도 서술형 문어체로 변환해주고, 일기처럼 하루를 정리하듯이 요약해주세요.`,
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