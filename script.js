const video = document.getElementById("camera");
const startBtn = document.getElementById("start");

startBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });
    video.srcObject = stream;
    await video.play();
  } catch (e) {
    alert(e.name + " : " + e.message);
    console.error(e);
  }
};









