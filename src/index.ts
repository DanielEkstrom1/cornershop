export function render(): string {
  return `
    <div class="container mx-auto p-4">
      <ul id="episode_list"></ul>
    </div>
  `;
}

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
export async function setup() {
  const response = await fetch("/api/media/list")
  const data: Episode[] = await response.json()

  const ul = document.querySelector("#episode_list")!
  for (var media of data) {
    console.log(media.anime_title)
    const li = document.createElement("li")
    
    const location = window.location.href
    const str =`${location}video?id=${media.id}`
    li.innerHTML = media.anime_title
    li.className = "cursor-pointer"
    li.onclick = () => {window.location.href = str}
    ul.appendChild(li)
  }
}


