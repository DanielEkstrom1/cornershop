package main

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"math"
	"os"
	"strings"
)

type Hls struct {
	Directory string
	Prober    Prober
}

const (
	HLSTIME = 3
)

//  ffmpeg -i short.mp4 -c:v h264 -flags +cgop -g 30 -threads 0 -hls_segment_type fmp4
// -hls_time 3 -hls_fmp4_init_filename init.mp4 -hls_playlist_type vod -hls_list_size 0
// -hls_segment_filename "paradise%d.mp4" out.m3u8

func (h *Hls) GenPlaylist(mkv string) ([]byte, error) {
	if _, err := os.Stat(mkv); errors.Is(err, os.ErrNotExist) {
		return []byte(""), os.ErrNotExist
	}
	sb := bytes.Buffer{}

	sb.WriteString("#EXTM3U\n")
	sb.WriteString("#EXT-X-VERSION:7\n")
	sb.WriteString("#EXT-X-TARGETDURATION:4\n")
	sb.WriteString("#EXT-X-MEDIA-SEQUENCE:0\n")
	sb.WriteString("#EXT-X-PLAYLIST-TYPE:VOD\n")
	sb.WriteString("#EXT-X-MAP:URI=\"init.mp4\"\n")

	io.CopyN(os.Stdout, strings.NewReader(sb.String()), int64(sb.Len()))

	info, err := h.Prober.Probe(mkv)
	if err != nil {
		return []byte(""), err
	}

	segments := math.Floor(float64(info.Format.Duration) / HLSTIME)

	for index := range int(segments) {
		sb.WriteString("#EXTINF:3.000000,\n")
		sb.WriteString(fmt.Sprintf("hash%d.mp4\n", index))
	}
	sb.WriteString("#EXT-X-ENDLIST\n")

	return sb.Bytes(), nil
}
