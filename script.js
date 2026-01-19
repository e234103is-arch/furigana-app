let currentStream = null;

const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("captureBtn");

// カメラ起動（外カメラ）
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

// 撮影
captureBtn.onclick = () => {
  if (!currentStream) {
    alert("先にカメラを起動してください");
    return;
  }

  if (video.videoWidth === 0) {
    alert("カメラ準備中です。少し待ってください");
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  // 撮影フラッシュ演出
  document.body.style.background = "#fff";
  setTimeout(() => {
    document.body.style.background = "#000";
  }, 100);

  // デバッグ用表示
  canvas.style.display = "block";
};




