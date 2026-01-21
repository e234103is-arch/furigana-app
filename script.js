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
        facingMode: "environment", // 外カメラ
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
  }
});

// 画像を白黒・高コントラストにする関数（これで精度UP！）
function preprocessImage(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // 閾値（しきいち）：これより明るければ白、暗ければ黒にする
  const threshold = 100; 

  for (let i = 0; i < data.length; i += 4) {
    // RGBの平均をとってグレーにする
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    
    // 白か黒かに振り分ける（二値化）
    const color = avg > threshold ? 255 : 0;
    
    data[i] = color;     // R
    data[i + 1] = color; // G
    data[i + 2] = color; // B
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// 撮影 & 解析
captureBtn.addEventListener("click", async () => {
  if (!stream) {
    output.textContent = "先に「カメラ起動」を押してください";
    return;
  }

  output.textContent = "画像を処理中…";

  const w = video.videoWidth;
  const h = video.videoHeight;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  
  // 1. まず普通に描画
  ctx.drawImage(video, 0, 0, w, h);
  
  // 2. 画像を「白黒ハッキリ」に加工する（ここがポイント！）
  preprocessImage(ctx, w, h);

  output.textContent = "読み取り中…";

  try {
    // 日本語辞書を使って解析
    const result = await Tesseract.recognize(
      canvas,
      'jpn', 
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            output.textContent = `解析中... ${Math.round(m.progress * 100)}%`;
          }
        }
      }
    );

    // 結果表示
    if (result.data && result.data.text.trim().length > 0) {
      output.innerText = "【結果】\n" + result.data.text;
    } else {
      output.textContent = "文字が見つかりませんでした。もっと明るい場所で試してください。";
    }

  } catch (err) {
    console.error(err);
    output.textContent = "解析エラー: " + err.message;
  }
});
