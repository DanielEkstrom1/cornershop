import { Icon } from "@iconify/react";

interface VideoControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRewind: () => void;
  onForward: () => void;
  onToggleNerdInfo: () => void;
  onFullscreen: () => void;
}

function VideoControls({
  isPlaying,
  onPlayPause,
  onRewind,
  onForward,
  onToggleNerdInfo,
  onFullscreen,
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
      <button className="button info" id="info" onClick={onToggleNerdInfo}>
        nerdinfo
      </button>
      <button id="fullscreen" className="button" onClick={onFullscreen}>
        <Icon icon="ant-design:fullscreen-outlined" />
      </button>
    </div>
  );
}

export default VideoControls;
