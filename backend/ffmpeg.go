package main

import (
	"encoding/json"
	"errors"
	"io"
	"os"
	"os/exec"
)

type Prober struct {
}

//{
//  "programs": [],
//  "stream_groups": [],
//  "streams": [
//    {
//      "index": 3,
//      "tags": {
//        "language": "eng",
//        "title": "Full subtitles [koala]"
//      }
//    },
//    {
//      "index": 4,
//      "tags": {
//        "language": "eng",
//        "title": "Signs and songs [koala]"
//      }
//    }
//  ],
//  "format": {
//    "filename": "video.mkv",
//    "nb_streams": 10,
//    "nb_programs": 0,
//    "nb_stream_groups": 0,
//    "format_name": "matroska,webm",
//    "format_long_name": "Matroska / WebM",
//    "start_time": "-0.007000",
//    "duration": "1420.063000",
//    "size": "2101733945",
//    "bit_rate": "11840229",
//    "probe_score": 100,
//    "tags": {
//      "encoder": "libebml v1.4.4 + libmatroska v1.7.1",
//      "creation_time": "2023-10-10T13:38:02.000000Z"
//    }
//  }
//}

type ProbeInfo struct {
	Format struct {
		Filename   string  `json:"filename"`
		Duration   float32 `json:"duration,string"`
		Size       int64   `json:"size,string"`
		Bitrate    int     `json:"bit_rate,string"`
		Probescore int     `json:"probe_score"`
	} `json:"format"`
}

var (
	ErrNotFFMpegInstalled  = errors.New("ffmpeg not installed")
	ErrNotFFProbeInstalled = errors.New("ffprobe not installed")
	ErrCreatingStdoutPipe  = errors.New("error creating stdoutpipe")
	ErrCreatingstderrPipe  = errors.New("error creating stderrpipe")
)

func checkFFmpeg() error {
	cmd := exec.Command("ffmpeg", "-version")
	if err := cmd.Run(); err != nil {
		return ErrNotFFMpegInstalled
	}
	return nil
}
func checkFFProbe() error {
	cmd := exec.Command("ffprobe", "-version")

	if err := cmd.Run(); err != nil {
		return ErrNotFFProbeInstalled
	}
	return nil
}
func (p Prober) Probe(file string) (*ProbeInfo, error) {
	// If exists
	if _, err := os.Stat(file); errors.Is(err, os.ErrNotExist) {
		return nil, os.ErrNotExist
	}
	//ffprobe -i video.mkv -v error -select_streams s -show_entries stream=index:stream_tags=language,title -print_format json -show_format | jq
	cmd := exec.Command("ffprobe", "-i", file, "-v", "error", "-select_streams", "s",
		"-show_entries", "stream=index:stream_tags=language,title",
		"-print_format", "json", "-show_format")
	_ = exec.Command("echo", "-n", `{"Name": "Bob", "Age": 32}`)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, ErrCreatingStdoutPipe
	}

	stderr, err := cmd.StderrPipe()

	if err != nil {
		return nil, ErrCreatingStdoutPipe
	}

	if err := cmd.Start(); err != nil {
		io.Copy(os.Stdout, stderr)
		return nil, err
	}

	var info ProbeInfo

	if err := json.NewDecoder(stdout).Decode(&info); err != nil {
		if err != io.EOF {
			return nil, err
		}
	}

	return &info, nil
}
