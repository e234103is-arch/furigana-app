const video = document.getElementById("camera");
const button = document.getElementById("start");

button.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { exact: "environment" }
      }
    });
    video.srcObject = stream;
  } catch (e) {
    alert("外カメラを起動できません");
    console.error(e);
  }
};

