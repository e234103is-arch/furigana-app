// api/ocr.js
// OCR.space を使うためのバックエンド処理

module.exports = async (req, res) => {
  // CORS設定（スマホからのアクセスを許可）
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image, apiKey } = req.body; // フロントからキーを受け取る簡易方式

    if (!image) {
      return res.status(400).json({ error: '画像データがありません' });
    }

    // OCR.space に送信するためのデータ作成
    const formData = new URLSearchParams();
    formData.append('base64Image', image);
    formData.append('language', 'jpn'); // 日本語設定
    formData.append('isOverlayRequired', 'false');
    formData.append('apikey', apiKey); // 受け取ったキーを使用

    // OCR.space へ送信
    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await ocrResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("OCR Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
