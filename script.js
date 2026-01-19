let currentStream = null;

// 要素取得
const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("captureBtn");
const resultDiv = document.getElementById("result");

// =======================
// カメラ起動
// =======================
startBtn.onclick = async () => {
  try {
    if (currentStream) {
      currentStream.getTracks().forEach(t => t.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    currentStream = stream;
    video.srcObject = stream;
    await video.play();

  } catch (e) {
    alert("カメラ起動失敗");
    console.error(e);
  }
};

// =======================
// 撮影 → OCR
// =======================
captureBtn.onclick = async () => {

  // 動作確認用
  resultDiv.textContent = "📸 撮影しました。OCR準備中...";

  if (!currentStream) {
    resultDiv.textContent = "❌ カメラが起動していません";
    return;
  }

  if (video.readyState < 2) {
    resultDiv.textContent = "⏳ カメラ準備中です";
    return;
  }

  // 撮影
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  // Base64化
  const imageBase64 = canvas
    .toDataURL("image/jpeg", 0.9)
    .replace(/^data:image\/jpeg;base64,/, "");

  // OCR開始表示
  resultDiv.textContent = "⏳ 文字認識中...";

  try {
    const res = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "apikey": "ここにあなたのAPIキー",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        base64Image: "data:image/jpeg;base64," + imageBase64,
        language: "jpn"
      })
    });

    const data = await res.json();
    console.log(data);

    if (data.ParsedResults && data.ParsedResults.length > 0) {
      resultDiv.textContent =
        data.ParsedResults[0].ParsedText || "文字が検出されませんでした";
    } else {
      resultDiv.textContent = "❌ OCR失敗";
    }

  } catch (e) {
    console.error(e);
    resultDiv.textContent = "❌ OCR通信エラー";
  }

  // フラッシュ
  document.body.style.background = "#fff";
  setTimeout(() => {
    document.body.style.background = "#000";
  }, 100);
};







