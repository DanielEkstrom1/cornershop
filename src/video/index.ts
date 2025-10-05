import Hls from "hls.js";

export function render(): string {
  const html = `
<div  class="flex flex-col items-center justify-center">
<video width="900" id="video"></video>
<div class="flex flex-col w-full">
<div class="flex">
<button id="play" class="btn">Play</button>
<button id="pause" class="btn">Pause</button>
<button id="info" class="btn">Playback Info</button>
</div>
<div class="flex items-center p-2 w-full">
<p id="start" >start</p>
<progress class="mx-8 w-full progress progress-neutral" id="bufferProgress" max="100" min="0" value="0" type="range"></progress>
<p id="end" >end</p>
</div>
</div>
</div>
`;
  return html;
}

var hls: Hls
export function setup(): void {
  hls = new Hls();
  setupVideo(document.querySelector<HTMLVideoElement>("#video")!);
}

var prog: HTMLProgressElement;
var playbtn: HTMLButtonElement;
var pausebtn: HTMLButtonElement;
var infobtn: HTMLButtonElement;
var starttxt: HTMLParagraphElement;
var endtxt: HTMLParagraphElement;

async function setupVideo(element: HTMLVideoElement) {
  let errocount = 0
  prog = document.querySelector<HTMLProgressElement>("#bufferProgress")!;
  playbtn = document.querySelector<HTMLButtonElement>("#play")!;
  pausebtn = document.querySelector<HTMLButtonElement>("#pause")!;
  infobtn = document.querySelector<HTMLButtonElement>("#info")!;
  starttxt = document.querySelector<HTMLParagraphElement>("#start")!;
  endtxt = document.querySelector<HTMLParagraphElement>("#end")!;

  playbtn!.onclick = () => playVideo(element);
  pausebtn!.onclick = () => element.pause();
  infobtn!.onclick = () => info();
  if (Hls.isSupported()) {
    hls.on(Hls.Events.MEDIA_ATTACHED, function (_, data) {
      endtxt.innerHTML = data.mediaSource!.duration.toFixed(0);
      starttxt.innerHTML = `${0}`;
      console.log("video and hls.js are now bound together !");
    });

    hls.on(Hls.Events.LEVEL_LOADED, function () {
      console.log("Level loaded");
    });
    hls.on(Hls.Events.BUFFER_APPENDING, function () {
      console.log("BUFFER_APPENDING");
    });
    hls.on(Hls.Events.MANIFEST_PARSED, function (_, data) {
      console.log("manifest loaded, found " + data.levels + " quality level");
    });

    hls.on(Hls.Events.ERROR, function (_, data) {
      console.log(data);
      var errorType = data.type;
      var errorDetails = data.details;
      var errorFatal = data.fatal;

      console.log(errorType);
      console.log(errorDetails);
      console.log(errorFatal);

      switch (data.details) {
        case Hls.ErrorDetails.FRAG_LOAD_ERROR:
          console.log("Frag load error");
          if (errocount++ > 3) {
          hls.detachMedia()
          hls.destroy()
          }
          break;
        case Hls.ErrorDetails.MANIFEST_PARSING_ERROR:
          console.log(data.error.stack);
          hls.detachMedia()
          hls.destroy()
          break;
        default:
          break;
      }
    });

    //const videoUrl = await getMainPlaylist()
    const videoUrl = new URL("api/video/main.m3u8", `${window.location.href}`);
    const id = new URL(window.location.href).searchParams.get("id")
    console.log(id)
    if (!id) window.location.href = "/"
    videoUrl.searchParams.set("id", id!)
    hls.loadSource(videoUrl.href);
    hls.attachMedia(element);
  }
}

function info() {
  console.log(hls.interstitialsManager?.primary.currentTime);
}

export function playVideo(element: HTMLVideoElement) {
  element.play();
  setInterval(() => {
    if (hls.interstitialsManager) {
      const currentTime = hls.interstitialsManager?.primary.currentTime;
      const duration = hls.interstitialsManager?.primary.duration;
      starttxt!.innerHTML = `${currentTime.toFixed(0)}`;
      endtxt!.innerHTML = `${duration.toFixed(0)}`;
      const diff =
        100 -
        Math.ceil(
          hls.interstitialsManager?.primary.duration -
            hls.interstitialsManager?.primary.currentTime,
        );
      prog!.value = Number(diff.toFixed(0));
    }
  }, 1000);
}
