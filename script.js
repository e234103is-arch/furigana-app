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
        facingMode: "environment", // 外カメラ優先
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

// 撮影 & OCR実行
captureBtn.addEventListener("click", async () => {
  if (!stream) {
    output.textContent = "先に「カメラ起動」を押してください";
    return;
  }

  output.textContent = "画像を処理中…";

  // --- 画像圧縮処理 (Vercel対策) ---
  const MAX_SIZE = 1024; // 長辺を1024pxに制限
  let w = video.videoWidth;
  let h = video.videoHeight;
  
  // サイズ計算
  if (w > h) {
    if (w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE; }
  } else {
    if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE; }
  }

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);

  // Base64化 (JPEG品質 0.7)
  const base64Data = canvas.toDataURL("image/jpeg", 0.7);
  const purelyBase64 = base64Data.split(",")[1]; // "data:image..." を削除

  output.textContent = "AIに送信中…";

  try {
    // 同じドメインのAPIを叩く
    const res = await fetch("/api/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: purelyBase64 })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`エラー(${res.status}): ${errText}`);
    }

    const data = await res.json();
    console.log("結果:", data);

    // 結果表示
    if (data.responses && data.responses[0]?.fullTextAnnotation) {
      output.textContent = data.responses[0].fullTextAnnotation.text;
    } else if (data.error) {
      output.textContent = "APIエラー: " + JSON.stringify(data.error);
    } else {
      output.textContent = "文字が見つかりませんでした";
    }

  } catch (err) {
    console.error(err);
    output.textContent = "通信失敗: " + err.message;
  }
});
