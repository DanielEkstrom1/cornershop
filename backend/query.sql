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
) VALUES (
  ?, ?, ?, ? ,?, ? ,? ,?, ?, ? ,?
)
RETURNING *;

-- name: DeleteEpisode :exec
DELETE FROM episode
WHERE id = ?;
