
interface VolumeControlsProps {
  onClick: () => void;
}

function VolumeControls({
  onClick
}: VolumeControlsProps) {
  return (
    <div className="controls">
      <input onClick={onClick} className={"progress"} type="range" max={100} min={100} step={0.01}></input>
    </div>
  );
}

export default VolumeControls;
