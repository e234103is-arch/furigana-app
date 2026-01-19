const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const captureBtn = document.getElementById("captureBtn");

let currentStream = null;

startBtn.onclick = async () => {
  try {
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    video.srcObject = currentStream;
  } catch (e) {
    alert("カメラ起動失敗");
    console.error(e);
  }
};

captureBtn.onclick = () => {
  if (!currentStream) {
    alert("先にカメラを起動してください");
    return;
  }

  if (video.videoWidth === 0) {
    alert("カメラ準備中です");
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
};




