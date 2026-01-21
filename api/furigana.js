module.exports = async (req, res) => {
  // CORS設定（おまじない）
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

  const { text, apiKey } = req.body;
  if (!text) return res.status(400).json({ error: 'テキストが空です' });
  if (!apiKey) return res.status(400).json({ error: 'APIキーが届いていません' });

  // 試すモデルのリスト（上から順に試します）
  // 1. 最新の軽量版 (1.5 Flash)
  // 2. 安定版 (1.0 Pro)
  // 3. 旧安定版 (gemini-pro)
  const candidateModels = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.0-pro",
    "gemini-pro"
  ];

  let lastError = null;

  // 順番に試していくループ
  for (const modelName of candidateModels) {
    try {
      console.log(`Testing model: ${modelName}`); // ログ用
      
      // バージョンは v1beta が一番広く対応しています
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `以下のテキストを、漢字をひらがなに開いて出力してください。余計な記号や解説は不要です。ひらがなのみ返してください。\nテキスト: ${text}` }]
          }]
        })
      });

      const data = await response.json();

      // もしこのモデルでエラーが出たら、次のモデルへ
      if (data.error) {
        lastError = data.error;
        console.log(`Model ${modelName} failed:`, data.error.message);
        continue; 
      }

      // 成功したら、ここで終了して結果を返す！
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const hiragana = data.candidates[0].content.parts[0].text.trim();
        return res.status(200).json({ converted: hiragana, modelUsed: modelName });
      }

    } catch (err) {
      lastError = err;
      console.log(`Network error with ${modelName}`);
    }
  }

  // 全部失敗した場合
  return res.status(400).json({ 
    error: `すべてのモデルで失敗しました。最後のGoogleエラー: ${lastError ? (lastError.message || JSON.stringify(lastError)) : "不明"}` 
  });
};
