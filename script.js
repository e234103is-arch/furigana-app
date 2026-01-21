// ▼▼▼ ここに OCR.space のキーを設定してください ▼▼▼
const OCR_SPACE_API_KEY = 'K82889223688957';
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

document.addEventListener('DOMContentLoaded', () => {
    const convertBtn = document.getElementById('convert-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const fileInput = document.getElementById('file-input');
    const inputText = document.getElementById('input-text');
    const resultText = document.getElementById('result-text');
    const loading = document.getElementById('loading');
    const loadingText = document.querySelector('#loading p');

    // ■ 画像圧縮用の関数（ここが重要！）
    const compressImage = async (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.onerror = reject;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // サイズが大きすぎたら縮小する（長辺を1500px以下に）
                const MAX_SIZE = 1500;
                if (width > MAX_SIZE || height > MAX_SIZE) {
                    if (width > height) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    } else {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // JPEG形式で圧縮（画質0.7）
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("圧縮に失敗しました"));
                    }
                }, 'image/jpeg', 0.7);
            };

            reader.readAsDataURL(file);
        });
    };

    // ■■■ 1. カメラボタンを押した時の動き ■■■
    cameraBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // ■■■ 2. 写真が選ばれたら圧縮して OCR.space に送る ■■■
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        loadingText.innerText = "画像を処理しています...";
        loading.style.display = 'flex';

        try {
            // ★ここで画像を圧縮します！
            const compressedBlob = await compressImage(file);

            loadingText.innerText = "文字を読み取っています...";

            // OCR.space に送るためのデータを作成
            const formData = new FormData();
            formData.append('apikey', OCR_SPACE_API_KEY);
            formData.append('language', 'jpn');
            formData.append('isOverlayRequired', 'false');
            formData.append('file', compressedBlob, "image.jpg"); // 圧縮した画像を送る

            // OCR.space API に送信
            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            // 結果のチェック
            if (data.IsErroredOnProcessing) {
                alert("読み取りエラー: " + data.ErrorMessage);
            } else if (data.ParsedResults && data.ParsedResults.length > 0) {
                const detectedText = data.ParsedResults[0].ParsedText;
                inputText.value = detectedText;
            } else {
                alert("文字が見つかりませんでした。");
            }

        } catch (error) {
            console.error(error);
            alert("エラーが発生しました: " + error.message);
        } finally {
            loading.style.display = 'none';
            fileInput.value = '';
        }
    });

    // ■■■ 3. ふりがなボタンを押した時の動き（Yahooへ） ■■■
    convertBtn.addEventListener('click', async () => {
        const text = inputText.value;
        if (!text) {
            alert("文字を入力してください！");
            return;
        }

        inputText.blur();
        loadingText.innerText = "ふりがなを付けています...";
        loading.style.display = 'flex';
        
        try {
            const response = await fetch('/api/furigana', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });

            const data = await response.json();

            if (data.converted) {
                resultText.classList.remove('placeholder');
                resultText.style.color = '#1c1c1e';
                resultText.innerText = data.converted;
            } else {
                resultText.style.color = 'red';
                resultText.innerText = "エラー: " + (data.error || "変換できませんでした");
            }

        } catch (e) {
            console.error(e);
            resultText.style.color = 'red';
            resultText.innerText = "通信エラーが発生しました";
        } finally {
            loading.style.display = 'none';
        }
    });
});
