import { Icon } from "@iconify/react";
import VolumeControls from "./VolumeControl";
import type { RefObject } from "react";

interface VideoControlsProps {
        isPlaying: boolean;
        onPlayPause: () => void;
        onRewind: () => void;
        onForward: () => void;
        onToggleNerdInfo: () => void;
        onFullscreen: () => void;
        onVolume: (ev: React.MouseEvent<HTMLDivElement>) => void;
        videoRef: RefObject<HTMLVideoElement> | null;
}

function VideoControls({
        isPlaying,
        onPlayPause,
        onRewind,
        onForward,
        onToggleNerdInfo,
        onFullscreen,
        onVolume,
        videoRef
}: VideoControlsProps) {
        return (
                <div className="controls">
                        <button id="rewind" className="button" onClick={onRewind}>
                                <Icon icon="ant-design:backward-outlined" />
                        </button>
                        <button id="playpause" className="button" onClick={onPlayPause}>
                                {isPlaying ? (
                                        <Icon icon="ant-design:pause-outlined" />
                                ) : (
                                        <Icon icon="ant-design:caret-right-outlined" />
                                )}
                        </button>
                        <button id="forward" className="button" onClick={onForward}>
                                <Icon icon="ant-design:forward-outlined" />
                        </button>
                        <VolumeControls videoRef={videoRef} onClick={onVolume} />
                        <button className="button info" id="info" onClick={onToggleNerdInfo}>
                                <Icon icon="ant-design:bars-outlined"></Icon>
                        </button>
                        <button id="fullscreen" className="button" onClick={onFullscreen}>
                                <Icon icon="ant-design:expand-outlined" />
                        </button>
                </div>
        );
}

export default VideoControls;
