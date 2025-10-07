import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface Episode {
  id: number;
  anime_season: string;
  anime_title: string;
  audio_term: string;
  episode_number: string;
  file_checksum: string;
  file_extension: string;
  file_name: string;
  release_group: string;
  source: string;
  video_resolution: string;
  video_term: string;
}

function Home() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEpisodes() {
      const response = await fetch("/api/media/list");
      const data: Episode[] = await response.json();
      setEpisodes(data);
    }
    fetchEpisodes();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <ul id="episode_list">
        {episodes.map((media) => (
          <li
            key={media.id}
            className="cursor-pointer"
            onClick={() => navigate(`/video?id=${media.id}`)}
          >
            {media.anime_title ? media.anime_title : media.file_name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
