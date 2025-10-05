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

CREATE TABLE user_session (
  id   INTEGER PRIMARY KEY,
  device TEXT NOT NULL,
  anime_title TEXT NOT NULL ,
  episode_number TEXT  NOT NULL,
  playing BOOLEAN NOT NULL DEFAULT false,
  transcoding BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(device) REFERENCES device(device),
  FOREIGN KEY(anime_title) REFERENCES episode(anime_title),
  FOREIGN KEY(episode_number) REFERENCES episode(episode_number)
);

CREATE TABLE device (
  id TEXT PRIMARY KEY NOT NULL,
  agent TEXT NOT NULL
);
