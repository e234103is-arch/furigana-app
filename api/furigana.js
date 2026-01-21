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

    // ★★★ ここを変更しました！「gemini-pro」を使います ★★★
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
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

    // エラーチェック
    if (data.error) {
      console.error("Google API Error:", JSON.stringify(data.error));
      return res.status(400).json({ 
        error: `Googleエラー: ${data.error.message || JSON.stringify(data.error)}` 
      });
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
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
