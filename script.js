const video = document.getElementById("camera");
const button = document.getElementById("start");

button.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (e) {
    alert("カメラを起動できません");
  }
};
