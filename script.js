const video = document.getElementById("camera");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const result = document.getElementById("result");

const canvas = document.createElement("canvas");

// カメラ起動（外カメラ）
startBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    video.srcObject = stream;
  } catch (e) {
    alert("カメラを起動できません");
  }
};

// 撮影 → OCR
captureBtn.onclick = async () => {
  result.textContent = "認識中…";

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  const base64Image = canvas
    .toDataURL("image/jpeg")
    .replace(/^data:image\/jpeg;base64,/, "");

  await runOCR(base64Image);
};

async function runOCR(base64Image) {
  const apiKey ="K86866935688957";

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

    if (
      data.ParsedResults &&
      data.ParsedResults.length > 0 &&
      data.ParsedResults[0].ParsedText
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











