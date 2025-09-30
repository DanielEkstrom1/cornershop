package main

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"math"
	"os"
	"path"
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

func (h Hls) getMedia() ([]*ProbeInfo, error) {
	entries, err := os.ReadDir(h.Directory)

	fmt.Println(entries)

	var result []*ProbeInfo

	if err != nil {
		return nil, err
	}

	for _, entry := range entries {
		file, err := entry.Info()
		if err != nil {
			return nil, err
		}

		ParseFile(file.Name())

		res, err := h.Prober.Probe(h.getPath(file.Name()))
		fmt.Println(res)

		if err != nil {
			return nil, nil
		}

		result = append(result, res)

	}

	return result, nil
}

func (h Hls) getPath(filename string) string {
	return path.Join(h.Directory, filename)

}

func (h Hls) GenPlaylist(mkv string) ([]byte, error) {
	fullpath := h.getPath(mkv)

	if _, err := os.Stat(fullpath); errors.Is(err, os.ErrNotExist) {
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

	info, err := h.Prober.Probe(fullpath)
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
