package main

import (
	cornershopdb "baller/cornershop/cornershop"
	"context"
	"strings"

	"github.com/nssteinbrenner/anitogo"
)

func ParseFile(file string) error {
	parsed := anitogo.Parse(file, anitogo.DefaultOptions)

	store := cornershopdb.New(db)

	if _, err := store.CreateEpisode(context.Background(), cornershopdb.CreateEpisodeParams{
		AnimeSeason:     strings.Join(parsed.AnimeSeason, " "),
		AnimeTitle:      parsed.AnimeTitle,
		AudioTerm:       strings.Join(parsed.AudioTerm, " "),
		EpisodeNumber:   strings.Join(parsed.EpisodeNumber, " "),
		FileChecksum:    parsed.FileChecksum,
		FileExtension:   parsed.FileExtension,
		FileName:        parsed.FileName,
		ReleaseGroup:    parsed.ReleaseGroup,
		Source:          strings.Join(parsed.Source, " "),
		VideoResolution: parsed.VideoResolution,
		VideoTerm:       strings.Join(parsed.VideoTerm, " "),
	}); err != nil {
		return err
	}

	return nil
}
