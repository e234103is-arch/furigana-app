// api/furigana.js
// Gemini APIを使って、漢字をひらがなに翻訳する

module.exports = async (req, res) => {
  // CORS設定（ここはこのままでOK）
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // プリフライトリクエスト対策
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // script.js から送られてきたデータ（テキストとキー）を受け取る
    const { text, apiKey } = req.body;

    if (!text || !apiKey) {
      return res.status(400).json({ error: 'テキストまたはAPIキーが届いていません' });
    }

    // Geminiへの命令文（プロンプト）
    const prompt = `以下の日本語のテキストを、漢字をひらがなに開いて、読みやすいひらがなだけの文章に変換してください。
    出力は変換後のテキストのみを返してください。余計な前置きや記号は不要です。
    
    テキスト: ${text}`;

    // Gemini APIのエンドポイント（gemini-1.5-flashを使用）
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Googleのサーバーへ送信
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();
    
    // 結果を取り出して返す
    if (data.candidates && data.candidates[0].content) {
        const hiragana = data.candidates[0].content.parts[0].text.trim();
        return res.status(200).json({ converted: hiragana });
    } else {
        // エラー内容をコンソールに出しつつ、フロントエンドにも伝える
        console.error('Gemini API Error:', JSON.stringify(data));
        return res.status(500).json({ 
            error: 'AIからの返答が不正です。APIキーが正しいか確認してください。',
            details: data 
        });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
