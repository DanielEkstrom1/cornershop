import { useState, useMemo } from "react";
import { NavLink, useNavigate, useNavigation, useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useVideoPlayer } from "../hooks/useVideoPlayer.ts";
import VideoControls from "../components/video/VideoControls.tsx";
import VideoSeekBar from "../components/video/VideoSeekBar.tsx";
import NerdInfo from "../components/video/NerdInfo.tsx";

function Video() {
        const [searchParams] = useSearchParams();
        const [showNerdInfo, setShowNerdInfo] = useState(false);

        const videoId = useMemo(() => searchParams.get("id"), [searchParams]);

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
                titleRef,
                episodeRef,
                onVolumeClick
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
                                <button className="button">
                                        <nav>
                                                <NavLink to="/">
                                                        <Icon icon="ant-design:arrow-left-outlined" />
                                                </NavLink>
                                        </nav>
                                </button>
                                <p id="title">{titleRef?.current}</p>
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
                                        onVolume={onVolumeClick}
                                        videoRef={videoRef!}
                                />
                                <VideoSeekBar currentTime={currentTime} duration={duration} onSeek={seek} />
                        </div>
                </>
        );
}

export default Video;
