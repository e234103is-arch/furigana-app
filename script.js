const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const output = document.getElementById("output");

let stream = null;

/**
 * カメラ起動（iPhone Safari 外カメラ優先）
 */
startBtn.addEventListener("click", async () => {
  output.textContent = "カメラ起動中…";

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    video.srcObject = stream;
    output.textContent = "カメラ起動完了";
  } catch (err) {
    console.error(err);
    output.textContent = "カメラを起動できません";
  }
});

/**
 * 撮影 → OCR
 */
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
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);

  const base64Image = canvas
    .toDataURL("image/jpeg")
    .replace(/^data:image\/jpeg;base64,/, "");

  output.textContent = "OCR中…";

  try {
    const res = await fetch(
      "https://vision-proxy-ddd6.vercel.app/api/ocr",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: base64Image
        })
      }
    );

    console.log("HTTP status:", res.status);

    const text = await res.text();
    console.log("Raw response:", text);

    if (!res.ok) {
      output.textContent = `APIエラー: ${res.status}`;
      return;
    }

    const data = JSON.parse(text);

    if (
      data.responses &&
      data.responses[0] &&
      data.responses[0].fullTextAnnotation
    ) {
      output.textContent =
        data.responses[0].fullTextAnnotation.text;
    } else {
      output.textContent = "文字を認識できませんでした";
    }

  } catch (err) {
    console.error(err);
    output.textContent = "通信エラー（fetch失敗）";
  }
});
