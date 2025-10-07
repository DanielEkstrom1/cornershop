export interface UserSession {
  anime_title: string;
  episode_number: string;
  playing: boolean;
  transcoding: boolean;
  position: number;
}

export interface NerdInfoField {
  label: string;
  value: string;
}

export interface NerdInfoSection {
  title: string;
  fields: string[];
}
