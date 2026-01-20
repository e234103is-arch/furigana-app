const video = document.getElementById("camera");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const result = document.getElementById("result");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let isVideoReady = false;

// カメラ起動
startBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }
    });

    video.srcObject = stream;
    video.setAttribute("playsinline", true); // iOS必須
    video.muted = true;

    video.oncanplay = () => {
      isVideoReady = true;
      console.log("video ready:", video.videoWidth, video.videoHeight);
    };

    await video.play(); // ★重要（iOS）
  } catch (e) {
    alert("カメラを起動できません");
    console.error(e);
  }
};

// 撮影
captureBtn.onclick = async () => {
  if (!isVideoReady) {
    result.textContent = "カメラ準備中です。少し待ってください。";
    return;
  }

  result.textContent = "認識中…";

  // ★ iOS対策：再生を保証
  await video.play();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const base64Image = canvas
    .toDataURL("image/jpeg", 0.9)
    .replace(/^data:image\/jpeg;base64,/, "");

  runOCR(base64Image);
};

async function runOCR(base64Image) {
  const apiKey = "K86866935688957";

  const formData = new FormData();
  formData.append("base64Image", base64Image);
  formData.append("language", "jpn");

  try {
    const res = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: apiKey },
      body: formData
    });

    const data = await res.json();
    console.log(data);

    const text =
      data?.ParsedResults?.[0]?.ParsedText?.trim();

    result.textContent = text || "文字を認識できませんでした";
  } catch (e) {
    result.textContent = "OCR通信エラー";
    console.error(e);
  }
}
