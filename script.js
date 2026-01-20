const video = document.getElementById("camera");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const result = document.getElementById("result");
const status = document.getElementById("status");
const canvas = document.getElementById("canvas");

// ① カメラ起動（外カメラ）
startBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } },
      audio: false
    });
    video.srcObject = stream;
    status.textContent = "カメラ起動中";
  } catch (e) {
    status.textContent = "カメラを起動できません";
    console.error(e);
  }
};

// ② 撮影 → OCR
captureBtn.onclick = async () => {
  status.textContent = "認識中…";

  // iPhone対策：metadata待ち
  if (video.videoWidth === 0) {
    await new Promise(resolve => {
      video.onloadedmetadata = resolve;
    });
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const base64Image = canvas
    .toDataURL("image/jpeg", 0.9)
    .replace(/^data:image\/jpeg;base64,/, "");

  await runOCR(base64Image);
};

// ③ OCR（Vercel 経由で Google Vision API）
async function runOCR(base64Image) {
  try {
    const response = await fetch(
      "https://vision-proxy-tau.vercel.app/api/ocr",
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

    console.log("status:", response.status);

    const data = await response.json();

    if (data.text) {
      result.textContent = data.text;
      status.textContent = "認識完了";
    } else {
      result.textContent = "文字を認識できませんでした";
      status.textContent = "失敗";
    }
  } catch (e) {
    result.textContent = "OCR通信エラー";
    status.textContent = "エラー";
    console.error(e);
  }
}
