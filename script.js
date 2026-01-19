let currentStream = null;

const video = document.getElementById("camera");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

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

captureBtn.onclick = () => {
  if (!currentStream) {
    alert("先にカメラを起動してください");
    return;
  }

  if (video.videoWidth === 0) {
    alert("カメラ準備中です。少し待ってから撮影してください");
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
};




