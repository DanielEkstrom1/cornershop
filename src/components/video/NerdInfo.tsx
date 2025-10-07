import { NERD_INFO_SECTIONS } from "../../utils/constants.ts";

interface NerdInfoProps {
  show: boolean;
}

function NerdInfo({ show }: NerdInfoProps) {
  if (!show) return null;

  return (
    <div className={`nerdinfo ${show ? "": "hidden"}`}>
      {Object.keys(NERD_INFO_SECTIONS).map((key) => (
        <div key={key} className="playerStat-stats">
          {key}
          {NERD_INFO_SECTIONS[key]!.map((field) => (
            <div key={field} className="playerStat-stat">
              <div className="playerStat-label">{field}</div>
              <div className="playerStat-value">empty</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default NerdInfo;
