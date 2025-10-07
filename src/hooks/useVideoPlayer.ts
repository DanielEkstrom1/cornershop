import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import SubtitlesOctopus from "libass-wasm";
import { reportSession, killSession, reportPlaying } from "../utils/videoApi.ts";
import type { UserSession } from "../types/video.ts";

export const useVideoPlayer = (videoId: string | null) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const instanceRef = useRef<SubtitlesOctopus | null>(null);
  const intervalRef = useRef<number | null>(null);
  const sessionIntervalRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const titleRef = useRef("");
  const episodeRef = useRef("");

  useEffect(() => {
    if (!videoId || !videoRef.current) return;

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
        console.log(data.subtitles);
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
      videoUrl.searchParams.set("id", videoId);
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
      const session: UserSession = {
        anime_title: titleRef.current,
        episode_number: episodeRef.current,
        playing: false,
        transcoding: false,
        position: Math.floor(currentTime),
      };
      killSession(session);
    };
  }, [videoId]);

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

  const startSessionReporting = async () => {
    if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);

    sessionIntervalRef.current = window.setInterval(async () => {
      const body: UserSession = {
        anime_title: titleRef.current,
        episode_number: episodeRef.current,
        playing: isPlaying,
        transcoding: false,
        position: Math.floor(currentTime),
      };

      await reportSession(body);
    }, 10000);
  };

  const playVideo = () => {
    if (!videoRef.current) return;
    togglePlay();
    startSessionReporting();
    updateUI();
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (!isPlaying) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
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
    const session: UserSession = {
      anime_title: titleRef.current,
      episode_number: episodeRef.current,
      playing: isPlaying,
      transcoding: false,
      position: Math.floor(currentTime),
    };
    await reportSession(session);
  };

  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  return {
    videoRef,
    isPlaying,
    duration,
    currentTime,
    togglePlay,
    handlePlay,
    handlePause,
    handleSeeked,
    seek,
    skip,
  };
};
