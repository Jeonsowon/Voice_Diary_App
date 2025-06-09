// 📁 utils/extractKeywords.js
import { OPENAI_API_KEY } from '@env';

export async function extractKeywords(text) {
  try {
    const prompt = `아래 일기 내용을 기반으로 다음 세 가지 항목에 해당하는 고유 키워드를 JSON 형식으로 추출해주세요:

- "who": 사람 이름 또는 지칭 (예: 친구, 엄마, 지수)
- "where": 장소 또는 위치명 (예: 카페, 집, 학교)
- "what": 주요 활동 또는 사건 (예: 공부, 운동, 여행)

다음 규칙을 따르세요:
- 같은 단어가 여러 번 나와도 한 번만 추출하세요.
- 너무 일반적인 단어(예: 오늘, 나, 있다)는 제외하고 **핵심적인 키워드만** 남기세요.
- 응답은 반드시 **정확한 JSON 형식**으로만 반환해주세요. (설명, 해설 없이)

JSON 형식 예시:
{"who": ["지수", "엄마"], "where": ["학교", "카페"], "what": ["시험공부", "점심식사"]}

일기 내용:
"""
${text}
"""`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '당신은 일기 내용을 분석해 핵심 키워드를 JSON으로만 추출하는 역할입니다.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 300,
      })
    });

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content?.trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('키워드 JSON 파싱 실패:', content);
      parsed = { who: [], where: [], what: [] };
    }

    return parsed;
  } catch (error) {
    console.error('키워드 추출 오류:', error);
    return { who: [], where: [], what: [] };
  }
}