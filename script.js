let currentStream = null;

// 要素取得
const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("captureBtn");

// （Base64確認用：textareaがある場合）
const output = document.getElementById("output");

// =======================
// カメラ起動（外カメラ）
// =======================
startBtn.onclick = async () => {
  try {
    // 既存ストリーム停止
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" }
      },
      audio: false
    });

    currentStream = stream;
    video.srcObject = stream;

    // iOS Safari 対策：明示的に再生
    await video.play();

  } catch (e) {
    alert("カメラを起動できません");
    console.error(e);
  }
};

// =======================
// 撮影処理
// =======================
captureBtn.onclick = () => {
  if (!currentStream) {
    alert("先にカメラを起動してください");
    return;
  }

  // iOS対策：映像準備チェック
  if (video.readyState < 2) {
    alert("カメラ準備中です。もう一度押してください");
    return;
  }

  // canvas に描画
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.style.display = "block";

  // =======================
  // Base64 取得（OCR用）
  // =======================
  const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);

  console.log("撮影画像(Base64):", imageBase64);

  // 画面確認用（textareaがある場合）
  if (output) {
    output.value = imageBase64;
  }

  // =======================
  // 撮影フラッシュ演出
  // =======================
  document.body.style.background = "#fff";
  setTimeout(() => {
    document.body.style.background = "#000";
  }, 100);
};





