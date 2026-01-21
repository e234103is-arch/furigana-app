// Node.js 標準モード (Serverless Function)

module.exports = async (req, res) => {
  // 1. CORS設定 (これをしないと拒否される)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. OPTIONSリクエスト（事前確認）への対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. POST以外はエラー
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // データ受け取り
    const { image } = req.body;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Server config error: API Key missing' });
    }

    // Google Vision APIへ送信
    const googleRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: image },
              features: [{ type: 'TEXT_DETECTION' }]
            }
          ]
        })
      }
    );

    const data = await googleRes.json();
    
    // 結果を返す
    return res.status(googleRes.status).json(data);

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

