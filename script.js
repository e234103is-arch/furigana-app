const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const output = document.getElementById("output");

let stream;

// ✅ ユーザー操作後に外側カメラ起動
startBtn.addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" }
      }
    });
    video.srcObject = stream;
  } catch (e) {
    output.textContent = "カメラを起動できません";
    console.error(e);
  }
});

captureBtn.addEventListener("click", async () => {
  if (!stream) {
    output.textContent = "先にカメラを起動してください";
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas
    .getContext("2d")
    .drawImage(video, 0, 0);

  const base64Image = canvas
    .toDataURL("image/jpeg")
    .replace(/^data:image\/jpeg;base64,/, "");

  output.textContent = "OCR中…";

  try {
    const res = await fetch(
      "https://vision-proxy-xxxx.vercel.app/api/ocr",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image })
      }
    );

    const data = await res.json();

    if (data.responses?.[0]?.fullTextAnnotation) {
      output.textContent =
        data.responses[0].fullTextAnnotation.text;
    } else {
      output.textContent = "文字を認識できませんでした";
    }
  } catch (e) {
    output.textContent = "通信エラー";
    console.error(e);
  }
});
