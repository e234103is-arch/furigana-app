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
      currentStream.getTracks().forEach(track => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    currentStream = stream;
    video.srcObject = stream;
    await video.play();

  } catch (e) {
    alert("カメラを起動できません");
    console.error(e);
  }
};

// =======================
// 撮影 → OCR
// =======================
captureBtn.onclick = async () => {
  if (!currentStream) {
    alert("先にカメラを起動してください");
    return;
  }

  if (video.readyState < 2) {
    alert("カメラ準備中です");
    return;
  }

  // 撮影
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  // Base64
  const imageBase64 = canvas
    .toDataURL("image/jpeg", 0.9)
    .replace(/^data:image\/jpeg;base64,/, "");

  resultDiv.textContent = "文字認識中...";

  // OCR.space API
  try {
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "apikey": "YOUR_API_KEY_HERE",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        base64Image: "data:image/jpeg;base64," + imageBase64,
        language: "jpn"
      })
    });

    const data = await response.json();

    if (data.ParsedResults && data.ParsedResults.length > 0) {
      const text = data.ParsedResults[0].ParsedText;
      resultDiv.textContent = text || "文字を認識できませんでした";
    } else {
      resultDiv.textContent = "OCR失敗";
    }

  } catch (e) {
    console.error(e);
    resultDiv.textContent = "OCRエラー";
  }

  // フラッシュ演出
  document.body.style.background = "#fff";
  setTimeout(() => {
    document.body.style.background = "#000";
  }, 100);
};






