const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const output = document.getElementById("output");

// ★ここにメールで届いたキーを入れてください
const MY_OCR_API_KEY = 'K82889223688957'; 

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

// 撮影 & OCR.spaceで解析
captureBtn.addEventListener("click", async () => {
  if (!stream) {
    alert("先にカメラを起動してください");
    return;
  }
  if (MY_OCR_API_KEY === 'ここにメールで届いたAPIキーを入れる') {
    alert("ソースコードのAPIキーを設定してください！");
    return;
  }

  output.textContent = "撮影＆送信中...";

  // 画像を生成
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  // Base64データを作成
  const base64Image = canvas.toDataURL("image/jpeg", 0.8);

  output.textContent = "解析中... (数秒かかります)";

  try {
    // Vercelの自分のサーバーへ送信
    const response = await fetch('/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64Image,
        apiKey: MY_OCR_API_KEY
      })
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    const result = await response.json();

    // 結果の取り出し
    if (result.ParsedResults && result.ParsedResults.length > 0) {
      const text = result.ParsedResults[0].ParsedText;
      output.innerText = "【結果】\n" + text;
    } else {
      output.textContent = "文字が読み取れませんでした。";
      console.log(result);
    }

  } catch (err) {
    console.error(err);
    output.textContent = "エラー: " + err.message;
  }
});
