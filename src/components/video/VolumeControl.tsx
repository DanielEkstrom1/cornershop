import { useEffect, useState, type RefObject } from "react";

interface VolumeControlsProps {
        onClick: (ev: React.MouseEvent<HTMLDivElement>) => void;
        videoRef: RefObject<HTMLVideoElement> | null;
}

function VolumeControls({
        onClick,
        videoRef
}: VolumeControlsProps) {

        const [volume, setVolume] = useState(100);

        useEffect(() => {
                const video = videoRef?.current;
                if (!video) return;

                const handleVolumeChange = () => {
                        setVolume(video.volume * 100);
                };

                video.onvolumechange = handleVolumeChange;
                console.log("bolume", video.volume)
                setVolume(video.volume * 100);

                return () => {
                        video.removeEventListener("volumechange", handleVolumeChange);
                };
        }, [videoRef]);

        return (
                <div className="volumeControlContainer">
                        <div onClick={onClick} className="sliderContainer">
                                <div
                                        className="sliderForeground nohover"
                                        style={{ width: `${volume}%` }}
                                ></div>
                                <div
                                        className="sliderBackground nohover"
                                        style={{ width: `${100 - volume}%` }}
                                ></div>
                        </div >
                </div>
        );
}

//<input onClick={onClick} className={"progress"} type="range" max={100} min={100} step={0.01}></input>
export default VolumeControls;
