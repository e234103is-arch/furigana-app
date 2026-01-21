const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const output = document.getElementById("output");

// ★★★ キー設定エリア ★★★
const MY_OCR_API_KEY    = 'K82889223688957'; 
const MY_GEMINI_API_KEY = 'AIzaSyDkr8OsQRR11dDgE4-wt1WAUBJ0K2CNPMg'; 
// ★★★★★★★★★★★★★★★

let stream = null;

// カメラ起動（変更なし）
startBtn.addEventListener("click", async () => {
  output.textContent = "カメラを準備中…";
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: 1280, height: 720 },
      audio: false
    });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      output.textContent = "カメラ準備OK！";
    };
  } catch (err) {
    output.textContent = "カメラエラー: " + err.message;
  }
});

// 撮影 -> OCR -> Geminiでふりがな
captureBtn.addEventListener("click", async () => {
  if (!stream) { alert("カメラを起動してください"); return; }
  
  if (MY_OCR_API_KEY.includes('OCR.space') || MY_GEMINI_API_KEY.includes('AIza')) {
    alert("キーが正しく設定されていません！");
    return;
  }

  output.textContent = "① 文字を読み取っています...";

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);
  const base64Image = canvas.toDataURL("image/jpeg", 0.8);

  try {
    // 1. OCR実行
    const ocrRes = await fetch('/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, apiKey: MY_OCR_API_KEY })
    });
    const ocrData = await ocrRes.json();

    if (!ocrData.ParsedResults || ocrData.ParsedResults.length === 0) {
      throw new Error("文字が見つかりませんでした");
    }
    
    const kanjiText = ocrData.ParsedResults[0].ParsedText;
    output.innerText = "【読み取り完了】\n" + kanjiText + "\n\n② AIがふりがなを考えています...";

    // 2. Geminiでふりがな変換
    // ★ここが変わりました：送るデータが 'apiKey' になっています
    const furiganaRes = await fetch('/api/furigana', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: kanjiText, apiKey: MY_GEMINI_API_KEY })
    });
    const furiganaData = await furiganaRes.json();

    // 結果表示
    output.innerText = "【原文】\n" + kanjiText + "\n\n【ふりがな (AI)】\n" + furiganaData.converted;

  } catch (err) {
    console.error(err);
    output.textContent = "エラー: " + err.message;
  }
});
