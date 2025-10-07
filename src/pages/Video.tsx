import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useVideoPlayer } from "../hooks/useVideoPlayer.ts";
import VideoControls from "../components/video/VideoControls.tsx";
import VideoSeekBar from "../components/video/VideoSeekBar.tsx";
import NerdInfo from "../components/video/NerdInfo.tsx";

function Video() {
  const [searchParams] = useSearchParams();
  const [showNerdInfo, setShowNerdInfo] = useState(false);

  const videoId = searchParams.get("id");

  const {
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
  } = useVideoPlayer(videoId);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.querySelector<HTMLDivElement>(".videoPlayerContainer")?.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <>
      <div className="videoPlayerContainer-onTop">
        <button onClick={() => (window.location.href = "/")} className="button">
          <Icon icon="ant-design:arrow-left-outlined" />
        </button>
        <p id="title">title</p>
      </div>

      <NerdInfo show={showNerdInfo} />

      <div className="videoPlayerContainer">
        <video
          ref={videoRef}
          className="htmlvideoplayer"
          id="video"
          onPlay={handlePlay}
          onPause={handlePause}
          onSeeked={handleSeeked}
          onClick={togglePlay}
        />
      </div>

      <div className="videoPlayerController">
        <VideoControls
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
          onRewind={() => skip(-20)}
          onForward={() => skip(20)}
          onToggleNerdInfo={() => setShowNerdInfo(!showNerdInfo)}
          onFullscreen={handleFullscreen}
        />
        <VideoSeekBar currentTime={currentTime} duration={duration} onSeek={seek} />
      </div>
    </>
  );
}

export default Video;
