-- name: GetEpisode :one
SELECT * FROM episode
WHERE id = ? LIMIT 1;

-- name: ListEpisodes :many
SELECT * FROM episode
ORDER BY anime_title;

-- name: CreateEpisode :one
INSERT INTO episode (
  anime_season ,
  anime_title ,
  audio_term ,
  episode_number ,
  file_checksum ,
  file_extension ,
  file_name ,
  release_group ,
  source ,
  video_resolution ,
  video_term
) 
VALUES (?,?,?,?,?,?,?,?,?,?,?)
RETURNING *;

-- name: DeleteEpisode :exec
DELETE FROM episode
WHERE id ='?';

-- name: CreateDevice :one
INSERT INTO device (
  id,
  agent
) VALUES (?,?)
RETURNING id;

-- name: GetDevice :one
SELECT id from device
WHERE id = ? limit 1;

-- name: CreateSession :exec
INSERT INTO user_session (
  device,
  anime_title,
  episode_number
) VALUES (?,?,?);

-- name: UpdateSession :exec
UPDATE user_session 
SET playing = ?,
  anime_title = ?,
  episode_number  = ?,
  transcoding  = ?,
  position  = ?
WHERE device = ?;

-- name: GetPlayback :one
SELECT * from user_session 
WHERE device = ?;

-- name: UpdatePlayingSession :exec
UPDATE user_session 
SET playing = ?
WHERE device = ?;


