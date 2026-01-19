// ★ 自分のAPIキーを入れる
const API_KEY = "ここにAPIキー";

const video = document.getElementById("camera");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const canvas = document.getElementById("canvas");
const status = document.getElementById("status");
const result = document.getElementById("result");

const ctx = canvas.getContext("2d");
let currentStream = null;

// カメラ起動（iOS Safari対策済）
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

    // ★ 重要：iOSでは明示的に再生
    await video.play();

    status.textContent = "カメラ起動完了";

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

  // 再生状態チェック（iOS対策）
  if (video.readyState < 2) {
    alert("カメラ準備中です。少し待ってください");
    return;
  }

  // 撮影
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  status.textContent = "文字認識中…";
  result.textContent = "";

  // Base64化
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










