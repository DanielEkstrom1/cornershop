import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Hls from "hls.js";
// @ts-ignore
import SubtitlesOctopus from "libass-wasm";
import {Icon} from "@iconify/react"

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

interface UserSession {
  anime_title: string;
  episode_number: string;
  playing: boolean;
  transcoding: boolean;
  position: number;
}

function Video() {
  const [searchParams] = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const instanceRef = useRef<SubtitlesOctopus | null>(null);
  const intervalRef = useRef<number | null>(null);
  const sessionIntervalRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showNerdInfo, setShowNerdInfo] = useState(false);
  const [toastPosition, setToastPosition] = useState({ x: 0, show: false });
  const [toastTime, setToastTime] = useState("");

  const titleRef = useRef("");
  const episodeRef = useRef("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) {
      window.location.href = "/";
      return;
    }

    if (!videoRef.current) return;

    const hls = new Hls();
    hlsRef.current = hls;
    let errorCount = 0;

    // Load subtitles
    const options = {
      video: videoRef.current,
      subUrl: "/api/video/sub.ass",
      fonts: ["/GUNPLAY-REGULAR.TTF"],
      workerUrl: "/node_modules/libass-wasm/dist/js/subtitles-octopus-worker.js",
      legacyWorkerUrl: "/node_modules/libass-wasm/subtitles-octopus-worker-legacy.js",
      prescaleFactor: 0.5,
    };
    instanceRef.current = new SubtitlesOctopus(options);

    if (Hls.isSupported()) {
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("video and hls.js are now bound together !");
      });

      hls.on(Hls.Events.LEVEL_LOADED, () => {
        console.log("Level loaded");
      });

      hls.on(Hls.Events.BUFFER_APPENDING, () => {
        console.log("BUFFER_APPENDING");
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        console.log("manifest parsed, found " + data.levels + " quality level");
        playVideo();
      });

      hls.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
        console.log("manifest loaded, found " + data.levels + " quality level");
        console.log(event);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.log(data);
        const errorType = data.type;
        const errorDetails = data.details;
        const errorFatal = data.fatal;

        console.log(errorType);
        console.log(errorDetails);
        console.log(errorFatal);

        switch (data.details) {
          case Hls.ErrorDetails.FRAG_LOAD_ERROR:
            console.log("Frag load error");
            if (errorCount++ > 3) {
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

      const videoUrl = new URL("api/video/main.m3u8", window.location.href);
      videoUrl.searchParams.set("id", id);
      hls.loadSource(videoUrl.href);
      hls.attachMedia(videoRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
      if (instanceRef.current) instanceRef.current.dispose();
      if (hlsRef.current) {
        hlsRef.current.detachMedia();
        hlsRef.current.destroy();
      }
      killSession();
    };
  }, [searchParams]);

  const playVideo = () => {
    if (!videoRef.current) return;

    togglePlay();
    reportSession();
    updateUI();
    reportSession();
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (!isPlaying) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const updateUI = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      if (hlsRef.current?.interstitialsManager) {
        const curr = hlsRef.current.interstitialsManager.primary.currentTime;
        const dur = hlsRef.current.interstitialsManager.primary.duration;
        setCurrentTime(curr);
        setDuration(dur);
      }
    }, 500);
  };

  const reportSession = async () => {
    if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);

    sessionIntervalRef.current = window.setInterval(async () => {
      const body: UserSession = {
        anime_title: titleRef.current,
        episode_number: episodeRef.current,
        playing: isPlaying,
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
  };

  const killSession = async () => {
    const body: UserSession = {
      anime_title: titleRef.current,
      episode_number: episodeRef.current,
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
  };

  const reportPlaying = async (playing: boolean) => {
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
  };

  const handlePlay = async () => {
    setIsPlaying(true);
    await reportPlaying(true);
  };

  const handlePause = async () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    await reportPlaying(false);
  };

  const handleSeeked = async () => {
    await reportSession();
  };

  const toTimerFormat = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString();
    const secs = Math.floor(seconds % 60);
    const secsStr = secs <= 9 ? `0${secs}` : `${secs}`;
    return `${mins}:${secsStr}`;
  };

  const handleSliderMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const coords = event.currentTarget.getBoundingClientRect();
    const percent = (Math.floor(Math.abs(event.clientX - coords.x)) / coords.width) * 100;
    const time = (percent / 100) * duration;
    setToastTime(toTimerFormat(time));
    setToastPosition({ x: event.clientX - 10, show: true });
  };

  const handleSliderMouseLeave = () => {
    setToastPosition({ x: 0, show: false });
  };

  const handleSliderClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const coords = event.currentTarget.getBoundingClientRect();
    const percent = (Math.floor(Math.abs(event.clientX - coords.x)) / coords.width) * 100;
    const toVideoTime = (percent / 100) * duration;
    videoRef.current.currentTime = toVideoTime;
    setCurrentTime(toVideoTime);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.querySelector<HTMLDivElement>(".videoPlayerContainer")?.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  };

  const diff = (currentTime / duration) * 100;

  return (
    <>
      <div className="videoPlayerContainer-onTop">
        <button className="button">
          <Icon icon="ant-design:arrow-left-outlined"></Icon>
        </button>
        <p id="title">title</p>
      </div>
      <div id="nerdinfo" className={`nerdinfo ${showNerdInfo ? "" : "hidden"}`}>
        {Object.keys(fields).map((key) => (
          <div key={key} className="playerStat-stats">
            {key}
            {fields[key]!.map((field) => (
              <div key={field} className="playerStat-stat">
                <div className="playerStat-label">{field}</div>
                <div className="playerStat-value">empty</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="videoPlayerContainer">
        <video
          ref={videoRef}
          className="htmlvideoplayer"
          id="video"
          onPlay={handlePlay}
          onPause={handlePause}
          onSeeked={handleSeeked}
          onClick={togglePlay}
        ></video>
      </div>
      <div className="videoPlayerController">
        <div className="controls">
          <button
            id="rewind"
            className="button"
            onClick={() => {
              if (videoRef.current) videoRef.current.currentTime -= 20;
            }}
          >
            <Icon icon="ant-design:backward-outlined"></Icon>
          </button>
          <button id="playpause" className="button" onClick={togglePlay}>
            {isPlaying ? (
              <Icon icon="ant-design:pause-outlined"></Icon>
            ) : (
              <Icon icon="ant-design:caret-right-outlined"></Icon>
            )}
          </button>
          <button
            id="forward"
            className="button"
            onClick={() => {
              if (videoRef.current) videoRef.current.currentTime += 20;
            }}
          >
            <Icon icon="ant-design:forward-outlined"></Icon>
          </button>
          <button
            className="button info"
            id="info"
            onClick={() => setShowNerdInfo(!showNerdInfo)}
          >
            nerdinfo
          </button>
          <button id="fullscreen" className="button" onClick={handleFullscreen}>
            <Icon icon="ant-design:fullscreen-outlined"></Icon>
          </button>
        </div>
        <div className="seek">
          <p id="start" className="currenttime">
            {toTimerFormat(currentTime)}
          </p>
          <div
            id="toast"
            className={`tooltip ${toastPosition.show ? "show" : ""}`}
            style={{ left: `${toastPosition.x}px` }}
          >
            {toastTime}
          </div>
          <div
            id="slider"
            className="sliderContainer"
            onMouseMove={handleSliderMouseMove}
            onMouseLeave={handleSliderMouseLeave}
            onClick={handleSliderClick}
          >
            <div
              className="sliderForeground nohover"
              style={{ width: `${diff.toFixed(10)}%` }}
            ></div>
            <div
              className="sliderBackground nohover"
              style={{ width: `${100 - diff}%` }}
            ></div>
          </div>
          <p id="end" className="endtime">
            {toTimerFormat(duration - currentTime)}
          </p>
        </div>
      </div>
    </>
  );
}

export default Video;
