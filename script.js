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
