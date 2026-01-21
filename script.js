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

    // ■■■ 1. カメラボタンを押した時の動き ■■■
    cameraBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // ■■■ 2. 写真が選ばれたら OCR.space に送る動き ■■■
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // ローディング表示
        loadingText.innerText = "画像を読み取っています...";
        loading.style.display = 'flex';

        try {
            // OCR.space に送るためのデータを作成
            const formData = new FormData();
            formData.append('apikey', OCR_SPACE_API_KEY);
            formData.append('language', 'jpn'); // ★重要：日本語設定
            formData.append('isOverlayRequired', 'false');
            formData.append('file', file); // 画像ファイルそのもの

            // OCR.space API に送信
            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                body: formData
                // ※FormDataを送る時は Content-Type ヘッダーを書いてはいけません
            });

            const data = await response.json();

            // 結果のチェック
            if (data.IsErroredOnProcessing) {
                alert("読み取りエラー: " + data.ErrorMessage);
            } else if (data.ParsedResults && data.ParsedResults.length > 0) {
                const detectedText = data.ParsedResults[0].ParsedText;
                inputText.value = detectedText; // 画面に入力
            } else {
                alert("文字が見つかりませんでした。");
            }

        } catch (error) {
            console.error(error);
            alert("通信エラーが発生しました。");
        } finally {
            loading.style.display = 'none';
            fileInput.value = ''; // リセット
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
