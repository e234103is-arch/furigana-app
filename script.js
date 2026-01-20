const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const button = document.getElementById("capture");
const output = document.getElementById("output");

// カメラ起動
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("カメラ起動失敗", err);
  });

button.addEventListener("click", async () => {
  // video → canvas
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  // base64 変換（ヘッダ削除）
  const base64Image = canvas
    .toDataURL("image/jpeg")
    .replace(/^data:image\/jpeg;base64,/, "");

  try {
    const res = await fetch("/api/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: base64Image
      })
    });

    const data = await res.json();
    console.log(data);

    if (
      data.responses &&
      data.responses[0] &&
      data.responses[0].fullTextAnnotation
    ) {
      output.textContent =
        data.responses[0].fullTextAnnotation.text;
    } else {
      output.textContent = "文字を認識できませんでした";
    }

  } catch (e) {
    console.error(e);
    output.textContent = "通信エラー";
  }
});
