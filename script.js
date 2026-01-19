let currentStream = null;

const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("captureBtn");

// カメラ起動
startBtn.onclick = async () => {
  try {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    currentStream = stream;
    video.srcObject = stream;

    // ★ iOS対策：明示的に再生
    await video.play();

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

  if (video.readyState < 2) {
    alert("カメラ準備中です。もう一度押してください");
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.style.display = "block";

  // 撮影フラッシュ
  document.body.style.background = "#fff";
  setTimeout(() => {
    document.body.style.background = "#000";
  }, 100);
};





