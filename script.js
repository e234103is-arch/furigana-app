// ★ ここにあなたのAPIキーを入れる
const API_KEY = AIzaSyBLgzDs6aoOLXc8CEz0SCxs-2OQmoLogFk;

const video = document.getElementById("camera");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const canvas = document.getElementById("canvas");
const status = document.getElementById("status");
const result = document.getElementById("result");

let currentStream = null;
const ctx = canvas.getContext("2d");

// カメラ起動（外カメラ）
startBtn.onclick = async () => {
  try {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }
    });

    currentStream = stream;
    video.srcObject = stream;

  } catch (e) {
    alert("カメラを起動できません");
    console.error(e);
  }
};

// 撮影 → OCR
captureBtn.onclick = async () => {
  if (!currentStream) {
    alert("先にカメラを起動してください");
    return;
  }

  if (video.videoWidth === 0) {
    alert("カメラ準備中です。少し待ってください");
    return;
  }

  // 撮影
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  status.textContent = "文字認識中…";
  result.textContent = "";

  const base64 = canvas.toDataURL("image/jpeg").split(",")[1];

  try {
    const res = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64 },
              features: [{ type: "TEXT_DETECTION" }],
              imageContext: { languageHints: ["ja"] }
            }
          ]
        })
      }
    );

    const data = await res.json();

    const text = data.responses?.[0]?.fullTextAnnotation?.text;

    if (!text) {
      status.textContent = "文字を認識できませんでした";
      return;
    }

    status.textContent = "認識完了";
    result.textContent = text;

  } catch (e) {
    status.textContent = "OCR失敗";
    console.error(e);
  }
};







