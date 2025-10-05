import Hls from "hls.js";
import "iconify-icon";
import type { IconifyIconHTMLElement } from "iconify-icon";

export function render(): string {
  const html = `
<div  class="flex flex-col items-center justify-center">
<video width="900" id="video"></video>
<div class="flex flex-col w-full">
<div class="flex">
<button id="rewind" class="btn">
<iconify-icon icon="ant-design:backward-outlined"></iconify-icon>
</button>
<button id="playpause" class="btn">
<iconify-icon id="playbtnicon" icon="ant-design:pause-outlined"></iconify-icon>
</button>
<button id="forward" class="btn">
<iconify-icon icon="ant-design:forward-outlined"></iconify-icon>
</button>
<button class="btn ml-auto" id="info" class="btn">Playback Info</button>
</div>
<div class="flex justify-between items-center p-2 w-full">
<p id="start" class="min-w-14 mr-auto" >0:00</p>
<div id="toast" data-tip="hello" class=" w-11/12 tooltip " >
<input class=" w-12/12 range fg-primary-content bg-primary" id="bufferProgress" max="100" min="0" value="0" type="range" step=".01"></input>
</div>
<p id="end" class="min-w-14 ml-auto text-end" >00:00</p>
</div>
</div>
</div>
`;
  return html;
}

var pauseIcon = `
<iconify-icon icon="ant-design:pause-outlined"></iconify-icon>
`;
var playIcon = `
<iconify-icon icon="ant-design:caret-right-outlined"></iconify-icon>
`;

var hls: Hls;
export function setup(): void {
  hls = new Hls();
  setupVideo(document.querySelector<HTMLVideoElement>("#video")!);
}

var prog: HTMLInputElement;
var playbtn: HTMLButtonElement;
var playbtnicon: IconifyIconHTMLElement;
var infobtn: HTMLButtonElement;
var starttxt: HTMLParagraphElement;
var endtxt: HTMLParagraphElement;

var IsPlaying = false;
var duration = 0;
var currentTime = 0;

var title = "";
var episode = "";

async function setupVideo(element: HTMLVideoElement) {
  let errocount = 0;
  prog = document.querySelector<HTMLInputElement>("#bufferProgress")!;
  playbtn = document.querySelector<HTMLButtonElement>("#playpause")!;
  infobtn = document.querySelector<HTMLButtonElement>("#info")!;
  starttxt = document.querySelector<HTMLParagraphElement>("#start")!;
  endtxt = document.querySelector<HTMLParagraphElement>("#end")!;
  playbtnicon = document.querySelector<IconifyIconHTMLElement>("#playbtnicon")!;

  await playbtnicon.loadIcon("ant-design:pause-outlined");
  await playbtnicon.loadIcon("ant-design:caret-right-outlined");

  handleVideoPlayerEvents(element);
  handleSeekPlayerEvents(prog, element);

  playbtn!.onclick = () => playVideo(element);
  infobtn!.onclick = () => info();

  document.querySelector<HTMLButtonElement>("#forward")!.onclick = () =>
    (element.currentTime += 20);

  document.querySelector<HTMLButtonElement>("#rewind")!.onclick = () =>
    (element.currentTime -= 20);

  if (Hls.isSupported()) {
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
      //endtxt.innerHTML = data.mediaSource!.duration.toFixed(0);
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
      playVideo(element);
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
            hls.detachMedia();
            hls.destroy();
          }
          break;
        case Hls.ErrorDetails.MANIFEST_PARSING_ERROR:
          console.log(data.error.stack);
          hls.detachMedia();
          hls.destroy();
          break;
        default:
          break;
      }
    });
    const videoUrl = new URL("api/video/main.m3u8", `${window.location.href}`);
    const id = new URL(window.location.href).searchParams.get("id");
    console.log(id);
    if (!id) window.location.href = "/";
    videoUrl.searchParams.set("id", id!);
    hls.loadSource(videoUrl.href);
    hls.attachMedia(element);
  }
}

function info() {
  console.log(hls.interstitialsManager?.primary.currentTime);
}

var interval: number;
var sessionInterval: number;

export function playVideo(element: HTMLVideoElement) {
  togglePlay(element);
  reportSession()
  interval = setInterval(() => {
    updateUI();
  }, 500);
  sessionInterval = setInterval(async () => {
    await reportSession();
  }, 10000);
}

function updateUI() {
  if (hls.interstitialsManager) {
    currentTime = hls.interstitialsManager?.primary.currentTime;
    duration = hls.interstitialsManager?.primary.duration;
    starttxt!.innerHTML = `${ToTimerFormat(currentTime)}`;
    endtxt!.innerHTML = `${ToTimerFormat(duration - currentTime)}`;
    const diff = (currentTime / duration) * 100;
    prog!.value = diff.toFixed(10);
  }
}

function ToTimerFormat(seconds: number): string {
  return `${ToMinutes(seconds)}:${ToSeconds(seconds)}`;
}

function ToMinutes(seconds: number): string {
  return Math.floor(seconds / 60).toString();
}
function ToSeconds(seconds: number): string {
  const digits = Math.floor(seconds % 60);
  return digits <= 9 ? `0${digits}` : `${digits}`;
}

function handleSeekPlayerEvents(
  input: HTMLInputElement,
  player: HTMLVideoElement,
) {
  const data = document.querySelector<HTMLDivElement>("#toast")!;
  input.onmousemove = (event) => {
    const width = input.getBoundingClientRect().width;
    const percent = (event.offsetX / width) * 100;
    data.setAttribute("data-tip", ToTimerFormat((percent / 100) * duration));
  };
  input.onclick = (event) => {
    const width = input.getBoundingClientRect().width;
    const percent = (event.offsetX / width) * 100;
    const tovideotime = (percent / 100) * duration;
    player.currentTime = tovideotime;
    currentTime = tovideotime;
  };
}
function handleVideoPlayerEvents(player: HTMLVideoElement) {
  player.onplay = async (_) => {
    IsPlaying = true;
    playbtn.innerHTML = pauseIcon;
    await reportPlaying(true);
  };
  player.onpause = async (_) => {
    IsPlaying = false;
    playbtn.innerHTML = playIcon;
    clearInterval(interval);
    await reportPlaying(false);
  };
  player.onseeked = async () => await reportSession();
  player.onclick = () => togglePlay(player);
}

function togglePlay(element: HTMLVideoElement) {
  if (!IsPlaying) {
    element.play();
  } else {
    element.pause();
  }
}
interface UserSession {
  anime_title: string;
  episode_number: string;
  playing: boolean;
  transcoding: boolean;
  position: number;
}

async function reportSession() {
  const body: UserSession = {
    anime_title: title,
    episode_number: episode,
    playing: IsPlaying,
    transcoding: false,
    position: Math.floor(currentTime),
  };

  const response = await fetch("/api/session/Session", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.log(await response.text());
  }
}

async function killSession() {
  const body: UserSession = {
    anime_title: title,
    episode_number: episode,
    playing: false,
    transcoding: false,
    position: Math.floor(currentTime),
  };

  const response = await fetch("/api/session/Killed", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.log(await response.text());
  }
}

async function reportPlaying(playing: boolean) {
  if (playing) {
    const response = await fetch("/api/session/Playing");
    if (!response.ok) {
      console.log(await response.text());
    }
  } else {
    const response = await fetch("/api/session/Stopped");
    if (!response.ok) {
      console.log(await response.text());
    }
  }
}


export async function destroy() {
  console.log("Killing session")
  clearInterval(interval);
  clearInterval(sessionInterval);
  hls.detachMedia();
  hls.destroy();
  await killSession()
}
