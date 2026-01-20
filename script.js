const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("start");
const captureBtn = document.getElementById("capture");
const output = document.getElementById("output");

let stream = null;

startBtn.addEventListener("click", async () => {
  output.textContent = "カメラ起動中…";

  // 以前のストリームがあれば停止
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

try {
  const res = await fetch(
    "https://vision-proxy-ddd6.vercel.app/api/ocr",
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

  console.log("HTTP status:", res.status);

  const text = await res.text(); // ← いったん text で取る
  console.log("Raw response:", text);

  if (!res.ok) {
    output.textContent = `APIエラー: ${res.status}`;
    return;
  }

  const data = JSON.parse(text);

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

} catch (err) {
  console.error(err);
  output.textContent = "通信エラー（fetch失敗）";
}
