import { useState } from "react";
import { toTimerFormat } from "../../utils/time.ts";

interface VideoSeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

function VideoSeekBar({ currentTime, duration, onSeek }: VideoSeekBarProps) {
  const [toastPosition, setToastPosition] = useState({ x: 0, show: false });
  const [toastTime, setToastTime] = useState("");

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const coords = event.currentTarget.getBoundingClientRect();
    const percent = (Math.floor(Math.abs(event.clientX - coords.x)) / coords.width) * 100;
    const time = (percent / 100) * duration;
    setToastTime(toTimerFormat(time));
    setToastPosition({ x: event.clientX - 10, show: true });
  };

  const handleMouseLeave = () => {
    setToastPosition({ x: 0, show: false });
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const coords = event.currentTarget.getBoundingClientRect();
    const percent = (Math.floor(Math.abs(event.clientX - coords.x)) / coords.width) * 100;
    const time = (percent / 100) * duration;
    onSeek(time);
  };

  const progress = (currentTime / duration) * 100;

  return (
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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div
          className="sliderForeground nohover"
          style={{ width: `${progress.toFixed(10)}%` }}
        ></div>
        <div
          className="sliderBackground nohover"
          style={{ width: `${100 - progress}%` }}
        ></div>
      </div>
      <p id="end" className="endtime">
        {toTimerFormat(duration - currentTime)}
      </p>
    </div>
  );
}

export default VideoSeekBar;
