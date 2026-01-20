const video = document.getElementById("camera");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const result = document.getElementById("result");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// カメラ起動（外カメラ）
startBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }
    });
    video.srcObject = stream;

    video.onloadedmetadata = () => {
      console.log("video size:", video.videoWidth, video.videoHeight);
    };
  } catch (e) {
    alert("カメラを起動できません");
    console.error(e);
  }
};

// 撮影 → OCR
captureBtn.onclick = async () => {
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    result.textContent = "カメラ準備中です。少し待ってください。";
    return;
  }

  result.textContent = "認識中…";

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const base64Image = canvas
    .toDataURL("image/jpeg", 0.9)
    .replace(/^data:image\/jpeg;base64,/, "");

  await runOCR(base64Image);
};

async function runOCR(base64Image) {
  const apiKey = "K86866935688957"; // テスト用

  const formData = new FormData();
  formData.append("base64Image", base64Image);
  formData.append("language", "jpn");
  formData.append("isOverlayRequired", "false");

  try {
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: apiKey
      },
      body: formData
    });

    const data = await response.json();
    console.log(data);

    if (
      data.ParsedResults &&
      data.ParsedResults.length > 0 &&
      data.ParsedResults[0].ParsedText &&
      data.ParsedResults[0].ParsedText.trim() !== ""
    ) {
      result.textContent = data.ParsedResults[0].ParsedText;
    } else {
      result.textContent = "文字を認識できませんでした";
    }
  } catch (e) {
    result.textContent = "OCR通信エラー";
    console.error(e);
  }
}
