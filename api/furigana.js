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
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'テキストが空です' });

    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    // ★ここに、さっき取得した「YahooのClient ID」を貼り付けてください！
    const YAHOO_CLIENT_ID = 'dmVyPTIwMjUwNyZpZD1sSmQ4Y0x4TGVXJmhhc2g9TlRZM056RXpPR1ppTWpRNE9USmtNQQ';
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    // Yahoo! JAPAN ルビ振りAPI (Furigana Service V2)
    const yahooUrl = 'https://jlp.yahooapis.jp/FuriganaService/V2/furigana';

    const response = await fetch(yahooUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `Yahoo AppID: ${YAHOO_CLIENT_ID}` // YahooはここにIDが必要
      },
      body: JSON.stringify({
        "id": "12345", // 適当なIDでOK
        "jsonrpc": "2.0",
        "method": "jlp.furiganaservice.furigana",
        "params": {
          "q": text,
          "grade": 1 // 1年生向け（全部ひらがなにする設定）
        }
      })
    });

    const data = await response.json();

    // エラーチェック
    if (data.error) {
      console.error("Yahoo API Error:", JSON.stringify(data.error));
      return res.status(400).json({ 
        error: `Yahooエラー: ${data.error.message || JSON.stringify(data.error)}` 
      });
    }

    // Yahooの返答からひらがなを結合する
    // data.result.word という配列に分解されて返ってくるので繋げます
    if (!data.result || !data.result.word) {
      return res.status(500).json({ error: 'Yahooからの返答が空でした' });
    }

    // surface(元の文字) と furigana(読み) が入っています。
    // furiganaが無い場合（ひらがなや記号）は surface を使います。
    const hiragana = data.result.word.map(w => w.furigana || w.surface).join('');

    return res.status(200).json({ converted: hiragana });

  } catch (error) {
    return res.status(500).json({ error: `サーバー内部エラー: ${error.message}` });
  }
};
