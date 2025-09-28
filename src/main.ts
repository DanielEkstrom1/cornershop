import "./style.css";
import { setupVideo } from "./video.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <video width="900" id="video"></video>
    <button onclick="document.querySelector('#video').play()">Play</button>
    <button onclick="document.querySelector('#video').pause()">Pause</button>
    <input id="input" max="100" min="0" value="0" type="range"></input>
  </div>
`;

setupVideo(document.querySelector<HTMLVideoElement>("#video")!, document.querySelector<HTMLInputElement>("#duration")!);
