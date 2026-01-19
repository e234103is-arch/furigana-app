let currentStream = null;

const video = document.getElementById("camera");
const button = document.getElementById("start");

button.onclick = async () => {
  try {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" }
      }
    });

    currentStream = stream;
    video.srcObject = stream;
  } catch (e) {
    alert("外カメラを起動できません");
    console.error(e);
  }
};



