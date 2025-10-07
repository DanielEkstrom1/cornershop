export const PLAYBACK_INFO_FIELDS = ["Player", "Play Method", "Protocol", "Stream Type"];

export const TRANSCODE_INFO_FIELDS = [
  "Video Codec",
  "Transcode Progress",
  "Transcode FPS",
  "Reason",
];

export const VIDEO_INFO_FIELDS = [
  "Player Dimentions",
  "Video Resolution",
  "Dropped Frames",
];

export const ORIGINAL_MEDIA_INFO = [
  "Container",
  "Size",
  "Bitrate",
  "Video Codec",
  "Video Bitrate",
  "Video Range",
  "Audio Codec",
  "Audio Sample Rate",
  "Audio Bitrate",
  "Audio Channels",
];

export const NERD_INFO_SECTIONS: Record<string, string[]> = {
  "Playback Info": PLAYBACK_INFO_FIELDS,
  "Transcode Info": TRANSCODE_INFO_FIELDS,
  "Video Info": VIDEO_INFO_FIELDS,
  "Media Info": ORIGINAL_MEDIA_INFO,
};
