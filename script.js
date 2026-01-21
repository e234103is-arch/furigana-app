const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const output = document.getElementById("output");

// ★★★ キー設定エリア ★★★
const MY_OCR_API_KEY='K82889223688957'; 
const MY_GEMINI_API_KEY='AIzaSyDkr8OsQRR11dDgE4-wt1WAUBJ0K2CNPMg'; 
// ★★★★★★★★★★★★★★★

let stream = null;

// カメラ起動
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

// 撮影 -> OCR -> Gemini
captureBtn.addEventListener("click", async () => {
  if (!stream) { alert("カメラを起動してください"); return; }
  
  output.textContent = "① 文字を読み取っています...";

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);
  const base64Image = canvas.toDataURL("image/jpeg", 0.8);

  try {
    // 1. OCRを実行
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
    const furiganaRes = await fetch('/api/furigana', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: kanjiText, apiKey: MY_GEMINI_API_KEY })
    });
    const furiganaData = await furiganaRes.json();

    // ▼▼▼ ここを変えました：エラーの中身を表示する ▼▼▼
    if (furiganaData.error) {
        output.innerText = "【エラー発生】\n" + furiganaData.error;
    } else if (furiganaData.converted) {
        output.innerText = "【原文】\n" + kanjiText + "\n\n【ふりがな (AI)】\n" + furiganaData.converted;
    } else {
        output.innerText = "【エラー】\nAIからの返答が空でした。\n(undefined)";
    }
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  } catch (err) {
    console.error(err);
    output.textContent = "通信エラー: " + err.message;
  }
});
