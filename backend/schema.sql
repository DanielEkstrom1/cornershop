CREATE TABLE episode (
  id   INTEGER PRIMARY KEY,
  anime_season TEXT NOT NULL,
  anime_title TEXT NOT NULL,
  audio_term TEXT NOT NULL,
  episode_number TEXT NOT NULL,
  file_checksum TEXT NOT NULL,
  file_extension TEXT NOT NULL,
  file_name TEXT NOT NULL,
  release_group TEXT NOT NULL,
  source TEXT NOT NULL,
  video_resolution TEXT NOT NULL,
  video_term TEXT NOT NULL
);

