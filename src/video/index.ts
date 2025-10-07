import Hls from "hls.js";
import "iconify-icon";
import type { IconifyIconHTMLElement } from "iconify-icon";

import SubtitlesOctopus from "libass-wasm";

export function render(): string {
  const html = `
<div class="videoPlayerContainer-onTop">
<button class=" button">
<iconify-icon id="playbtnicon" icon="ant-design:arrow-left-outlined"></iconify-icon>
</button>
<p id="title">title</p>
</div>
<div id="nerdinfo" class="nerdinfo">
</div>
<div class="videoPlayerContainer"> 
<video class="htmlvideoplayer" id="video"></video>
</div>
<div class="videoPlayerController">
<div class="controls">
<button id="rewind" class="button">
<iconify-icon icon="ant-design:backward-outlined"></iconify-icon>
</button>
<button id="playpause" class="button">
<iconify-icon id="playbtnicon" icon="ant-design:pause-outlined"></iconify-icon>
</button>
<button id="forward" class="button">
<iconify-icon icon="ant-design:forward-outlined"></iconify-icon>
</button>
<button class="button info" id="info">nerdinfo</button>
<button id="fullscreen" class="button" >
<iconify-icon icon="ant-design:fullscreen-outlined"></iconify-icon>
</button>
</div>
<div class="seek">
<p id="start" class="currenttime">0:00</p>
<div id="toast" data-tip="hello" class="tooltip" >
</div>
<div id="slider" class="sliderContainer">
<div class="sliderForeground nohover">
</div>
<div class="sliderBackground nohover">
</div>
</div>
<p id="end" class="endtime" >00:00</p>
</div>
</div>
`;
  return html;
}

// <input class="progress" id="bufferProgress" max="100" min="0" value="0" type="range" step=".01"></input>

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
var instance: SubtitlesOctopus = null;

function loadSubtitles() {
  var options = {
    video: document.getElementById("video"), // HTML5 video element
    subUrl: "/api/video/sub.ass", // Link to subtitles
    fonts: ["/GUNPLAY-REGULAR.TTF"], // Links to fonts (not required, default font already included in build)
    workerUrl: "/node_modules/libass-wasm/dist/js/subtitles-octopus-worker.js", // Link to WebAssembly-based file "libassjs-worker.js"
    legacyWorkerUrl:
      "/node_modules/libass-wasm/subtitles-octopus-worker-legacy.js", // Link to non-WebAssembly worker
    prescaleFactor: 0.5,
  };
  instance = new SubtitlesOctopus(options);

  console.log(instance);
}
async function setupVideo(element: HTMLVideoElement) {
  let errocount = 0;
  prog = document.querySelector<HTMLInputElement>("#slider")!;
  playbtn = document.querySelector<HTMLButtonElement>("#playpause")!;
  infobtn = document.querySelector<HTMLButtonElement>("#info")!;
  starttxt = document.querySelector<HTMLParagraphElement>("#start")!;
  endtxt = document.querySelector<HTMLParagraphElement>("#end")!;
  playbtnicon = document.querySelector<IconifyIconHTMLElement>("#playbtnicon")!;

  const nerdinfo = document.querySelector<HTMLDivElement>("#nerdinfo")!;
  const fullscreen =document.querySelector<HTMLButtonElement>("#fullscreen")!;
  fullscreen.onclick = () => {
    if (!document.fullscreenElement) {
      document.querySelector<HTMLDivElement>(".videoPlayerContainer")!.requestFullscreen();
    } else {
      // Otherwise exit the full screen
      document.exitFullscreen?.();
    }
  };

  await playbtnicon.loadIcon("ant-design:pause-outlined");
  await playbtnicon.loadIcon("ant-design:caret-right-outlined");

  loadSubtitles();
  handleVideoPlayerEvents(element);
  handleSeekPlayerEvents(prog, element);
  buildNerdInfo(nerdinfo);

  playbtn!.onclick = () => playVideo(element);
  infobtn!.onclick = () => nerdinfo.classList.toggle("hidden");

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
      console.log("manifest parsed, found " + data.levels + " quality level");
      playVideo(element);
    });

    hls.on(Hls.Events.MANIFEST_LOADED, function (event, data) {
      console.log("manifest loaded, found " + data.levels + " quality level");
      console.log(data.subtitles);
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

const PlaybackInfoFields = ["Player", "Play Method", "Protocol", "Stream Type"];

const TranscodeInfoFields = [
  "Video Codec",
  "Transcode Progress",
  "Transcode FPS",
  "Reason",
];

const VideoInfoFields = [
  "Player Dimentions",
  "Video Resolution",
  "Dropped Frames",
];

const OriginalMediaInfo = [
  "Container",
  "Size",
  "Bitrate",
  "Video Codec",
  "Video Bitrate",
  "Video Range",
  "Audio Codec",
  "Audio Sample Rate",
  "Audio Bitrate",
  "Audio Channels",
];

const fields: Record<string, string[]> = {
  "Playback Info": PlaybackInfoFields,
  "Transcode Info": TranscodeInfoFields,
  "Video Info": VideoInfoFields,
  "Media Info": OriginalMediaInfo,
};

function buildNerdInfo(nerdinfo: HTMLDivElement) {
  const div = document.createElement("div");
  Object.keys(fields).forEach((key) => {
    const headerFielddiv = document.createElement("div");
    headerFielddiv.className = "playerStat-stats";
    headerFielddiv.innerHTML = key;
    fields[key]!.forEach((field) => {
      const statdiv = document.createElement("div");
      statdiv.className = "playerStat-stat";
      const labelDiv = document.createElement("div");
      labelDiv.className = "playerStat-label";
      labelDiv.innerHTML = field;
      const valueDiv = document.createElement("div");
      valueDiv.className = "playerStat-value";
      valueDiv.innerHTML = "empty";
      statdiv.append(labelDiv, valueDiv);
      headerFielddiv.appendChild(statdiv);
    });
    div.appendChild(headerFielddiv);
  });
  nerdinfo.appendChild(div);
  //<div class="playerStats-stat playerStats-stat-header"><div class="playerStats-stat-label">Playback Info</div><div class="playerStats-stat-value"></div></div>
}

var interval: number;
var sessionInterval: number;

export async function playVideo(element: HTMLVideoElement) {
  togglePlay(element);
  reportSession();
  updateUI();
  await reportSession();
}

function updateUI() {
  interval = setInterval(() => {
    if (hls.interstitialsManager) {
      currentTime = hls.interstitialsManager?.primary.currentTime;
      duration = hls.interstitialsManager?.primary.duration;
      starttxt!.innerHTML = `${ToTimerFormat(currentTime)}`;
      endtxt!.innerHTML = `${ToTimerFormat(duration - currentTime)}`;
      const diff = (currentTime / duration) * 100;
      prog.querySelector<HTMLDivElement>(".sliderForeground")!.style.width =
        diff.toFixed(10) + "%";
      prog.querySelector<HTMLDivElement>(".sliderBackground")!.style.width =
        (100 - diff).toString() + "%";
    }
  }, 500);
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
    const toast = document.querySelector<HTMLDivElement>("#toast");
    toast?.classList.add("show");
    toast!.style.left = (event.x - 10).toString() + "px";
    const coords = input.getBoundingClientRect();
    const percent =
      (Math.floor(Math.abs(event.layerX - coords.x)) / coords.width) * 100;
    data.innerHTML = ToTimerFormat((percent / 100) * duration);
  };

  input.onmouseleave = () => {
    const toast = document.querySelector("#toast");
    toast?.classList.remove("show");
  };
  input.onclick = (event) => {
    const coord = input.getBoundingClientRect();
    const percent =
      (Math.floor(Math.abs(event.layerX - coord.x)) / coord.width) * 100;
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
  player.onplaying = (_) => {
    updateUI;
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
  sessionInterval = setInterval(async () => {
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
  }, 10000);
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
  console.log("Destroying player");
  clearInterval(interval);
  clearInterval(sessionInterval);
  instance.dispose();
  hls.detachMedia();
  hls.destroy();
  await killSession();
}
