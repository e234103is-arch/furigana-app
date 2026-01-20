// 要素取得
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureButton = document.getElementById("capture");
const output = document.getElementById("output");

// カメラ起動
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
    video.play();
  })
  .catch(err => {
    console.error("カメラ起動失敗", err);
  });

// 撮影 → OCR
captureButton.addEventListener("click", async () => {
  try {
    // canvas に描画
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    // base64 に変換（ヘッダ削除）
    const base64Image = canvas
      .toDataURL("image/jpeg")
      .replace(/^data:image\/jpeg;base64,/, "");

    // Vercel OCR API へ送信
    const response = await fetch(
      "https://vision-proxy-xxxx.vercel.app/api/ocr",
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

    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);

    // 結果表示
    if (
      result.responses &&
      result.responses[0] &&
      result.responses[0].fullTextAnnotation
    ) {
      output.textContent =
        result.responses[0].fullTextAnnotation.text;
    } else {
      output.textContent = "文字を認識できませんでした";
    }

  } catch (error) {
    console.error("OCRエラー", error);
    output.textContent = "エラーが発生しました";
  }
});
