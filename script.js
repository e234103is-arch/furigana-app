const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const output = document.getElementById("output");

let stream = null;

// カメラ起動（iPhone Safari 安定版）
startBtn.addEventListener("click", async () => {
  output.textContent = "カメラ起動中…";

  try {
    // 既に掴んでいたら解放（Safari対策）
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment"
      },
      audio: false
    });

    video.srcObject = stream;
    output.textContent = "カメラ起動完了";
  } catch (err) {
    console.error(err);
    output.textContent =
      "カメラを起動できません: " + err.name;
  }
});

// 撮影 → OCR
captureBtn.addEventListener("click", async () => {
  if (!stream) {
    output.textContent = "先にカメラを起動してください";
    return;
  }

  const w = video.videoWidth;
  const h = video.videoHeight;

  if (!w || !h) {
    output.textContent = "映像が準備できていません";
    return;
  }

  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(video, 0, 0, w, h);

  const base64Image = canvas
    .toDataURL("image/jpeg", 0.9)
    .replace(/^data:image\/jpeg;base64,/, "");

  output.textContent = "OCR中…";

  try {
    const res = await fetch(
      "https://vision-proxy-ddd6.vercel.app/api/ocr",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image })
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    if (data.responses?.[0]?.fullTextAnnotation) {
      output.textContent =
        data.responses[0].fullTextAnnotation.text;
    } else {
      output.textContent = "文字を認識できませんでした";
    }
  } catch (err) {
    console.error(err);
    output.textContent = "通信エラー";
  }
});
