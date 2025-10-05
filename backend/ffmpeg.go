package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path"
	"strings"
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

type ChanWriter struct {
	donech chan struct{}
	recvch chan []byte
}

func newChanWrite(ch chan []byte) *ChanWriter {
	donech := make(chan struct{})
	return &ChanWriter{
		donech: donech,
		recvch: ch,
	}
}

func (c ChanWriter) Write(b []byte) (int, error) {
	c.recvch <- b
	return len(b), nil
}

func (p Prober) SegmentMKVToHLS(ctx context.Context, filepath, outdir string) error {
	if _, err := os.Stat(filepath); errors.Is(err, os.ErrNotExist) {
		return os.ErrNotExist
	}

	// 	ffmpeg -noaccurate_seek -init_hw_device cuda=cu:0 -filter_hw_device cu
	// 	-hwaccel cuda -hwaccel_output_format cuda -noautorotate -hwaccel_flags +unsafe_output
	//  -threads 1 -canvas_size 1920x1080 -i video.mkv -codec:v:0 h264_nvenc
	//  -preset fast -vf "scale_cuda=format=yuv420p" -flags +cgop -g 30
	//  -threads 0 -hls_segment_type fmp4 -hls_time 3 -hls_fmp4_init_filename init.mp4
	//  -hls_playlist_type vod -hls_list_size 0 -hls_segment_filename "hash%d.mp4" out.m3u8

	log.Printf("Writing to %s\n", outdir)

	cmd := exec.Command("ffmpeg", "-noaccurate_seek", "-init_hw_device", "cuda=cu:0", "-filter_hw_device", "cu",
		"-hwaccel", "cuda", "-hwaccel_output_format", "cuda", "-noautorotate", "-v", "quiet", "-stats", "-hwaccel_flags", "+unsafe_output",
		"-threads", "1", "-canvas_size", "1920x1080", "-i", filepath, "-codec:v:0", "h264_nvenc",
		"-preset", "fast", "-vf", "scale_cuda=format=yuv420p", "-flags", "+cgop", "-g", "30",
		"-threads", "0", "-hls_segment_type", "fmp4", "-hls_time", fmt.Sprintf("%d", HLSTIME), "-hls_fmp4_init_filename", "-1.mp4",
		"-hls_playlist_type", "vod", "-hls_list_size", "0", "-hls_segment_filename", fmt.Sprintf("%s", path.Join(outdir, "hash%d.mp4")), path.Join(outdir, "out.m3u8"))

	log.Printf("Running Command: %s", strings.Join(cmd.Args, " "))

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return err
	}

	id := ctx.Value("id")

	if id == nil {
		return errors.New("No id found in context")
	}

	client := hub.clients[id.(string)]
	client.cmd = cmd

	chWriter := newChanWrite(client.outbuf)

	go func() {
		for {
			select {
			case <-chWriter.donech:
				log.Println("Closing stderr channel")
				return
			default:
				io.Copy(chWriter, stderr)
			}
		}
	}()

	defer close(chWriter.donech)

	if err := cmd.Run(); err != nil {
		return err
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
