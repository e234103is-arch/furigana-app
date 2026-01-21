module.exports = async (req, res) => {
  // CORS設定
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { text, apiKey } = req.body;

    if (!text) return res.status(400).json({ error: 'テキストが空です' });
    if (!apiKey) return res.status(400).json({ error: 'APIキーが届いていません' });

    // Gemini APIへのリクエスト
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `以下のテキストを、漢字をひらがなに開いて出力してください。余計な記号は書かないでください。\nテキスト: ${text}` }]
        }]
      })
    });

    const data = await response.json();

    // ★★★ エラーの原因を特定する部分 ★★★
    
    // パターンA: Googleが明確にエラーを返している場合
    if (data.error) {
      console.error("Google API Error:", JSON.stringify(data.error));
      return res.status(400).json({ 
        error: `Googleエラー: ${data.error.message || JSON.stringify(data.error)}` 
      });
    }

    // パターンB: 成功したが、回答の形式が予想と違う場合
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("Unexpected Response:", JSON.stringify(data));
      return res.status(500).json({ 
        error: `返答形式エラー: ${JSON.stringify(data)}` 
      });
    }

    // 成功
    const hiragana = data.candidates[0].content.parts[0].text.trim();
    return res.status(200).json({ converted: hiragana });

  } catch (error) {
    return res.status(500).json({ error: `サーバー内部エラー: ${error.message}` });
  }
};
