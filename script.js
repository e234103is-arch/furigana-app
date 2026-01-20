const video = document.getElementById("camera");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const result = document.getElementById("result");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let stream = null;

// カメラ起動
startBtn.onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });

    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    video.muted = true;

    await video.play();

    result.textContent = "カメラ起動完了";
  } catch (e) {
    alert("カメラ起動失敗");
    console.error(e);
  }
};

// 撮影（iOS対応）
captureBtn.onclick = async () => {
  result.textContent = "撮影中…";

  // ★ iOS Safari 対策：1フレーム待つ
  requestAnimationFrame(() => {
    setTimeout(() => {
      const w = video.videoWidth;
      const h = video.videoHeight;

      if (!w || !h) {
        result.textContent = "映像サイズ取得失敗";
        return;
      }

      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(video, 0, 0, w, h);

      // デバッグ用：canvasを一時表示
      canvas.style.display = "block";

      const base64Image = canvas
        .toDataURL("image/jpeg", 0.9)
        .replace(/^data:image\/jpeg;base64,/, "");

      runOCR(base64Image);
    }, 300); // ★ 300ms待つ（超重要）
  });
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

    const text = data?.ParsedResults?.[0]?.ParsedText?.trim();
    result.textContent = text || "文字を認識できませんでした";
  } catch (e) {
    result.textContent = "OCR通信エラー";
    console.error(e);
  }
}
