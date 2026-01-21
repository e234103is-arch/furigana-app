const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const output = document.getElementById("output");

let stream = null;

// カメラ起動
startBtn.addEventListener("click", async () => {
  output.textContent = "カメラを準備中…";
  
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 } 
      },
      audio: false
    });
    
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      output.textContent = "カメラ準備OK！撮影ボタンを押してください";
    };
  } catch (err) {
    console.error(err);
    output.textContent = "カメラエラー: " + err.message;
    alert("カメラの許可を確認してください");
  }
});

// 撮影 & Tesseract.jsで解析
captureBtn.addEventListener("click", async () => {
  if (!stream) {
    output.textContent = "先に「カメラ起動」を押してください";
    return;
  }

  output.textContent = "画像を処理中…";

  // 画像をキャンバスに描画
  const w = video.videoWidth;
  const h = video.videoHeight;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);

  output.textContent = "読み取り中… (初回は辞書DLに時間がかかります)";

  try {
    // Tesseract.js を実行 (日本語: 'jpn')
    const result = await Tesseract.recognize(
      canvas,
      'jpn', 
      {
        logger: m => {
          // 進捗状況を表示
          if (m.status === 'recognizing text') {
            output.textContent = `解析中... ${Math.round(m.progress * 100)}%`;
          } else {
            output.textContent = `準備中... (${m.status})`;
          }
        }
      }
    );

    console.log(result);

    // 結果表示
    if (result.data && result.data.text.trim().length > 0) {
      output.textContent = result.data.text;
    } else {
      output.textContent = "文字が見つかりませんでした";
    }

  } catch (err) {
    console.error(err);
    output.textContent = "解析失敗: " + err.message;
  }
});
