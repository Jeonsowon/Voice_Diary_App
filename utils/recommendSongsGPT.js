import { OPENAI_API_KEY } from '@env';

export async function recommendSongsFromDiary(text) {
  const prompt = `
다음 일기 내용을 읽고 감정을 분석한 후, 감정을 이모티콘과 함께 한 줄로 출력하고, 감정과 일기 내용에 어울리는 한국 노래 3곡을 추천해주세요.

형식 예시:
감정: 😊 행복
추천:
1. [가수 - 곡명]
2. ...
3. ...

일기:
${text}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const json = await response.json();
    const raw = json.choices?.[0]?.message?.content || '';

    // ✅ 이모티콘만 추출 (감정: 😊 행복)
    const emojiMatch = raw.match(/감정:\s*([\p{Emoji_Presentation}])/u);
    const emoji = emojiMatch ? emojiMatch[1] : '🎵';

    // ✅ 노래 리스트 추출
    const songs = raw
      .split('\n')
      .filter(line => /^[0-9]+\./.test(line))
      .map(line => line.replace(/^[0-9]+\.\s*/, ''));

    return {
      emotion: emoji, // ✅ 이모티콘만 반환
      songs,
    };

  } catch (err) {
    console.error('OpenAI 추천 오류:', err);
    return {
      emotion: '🎵',
      songs: [],
    };
  }
}
