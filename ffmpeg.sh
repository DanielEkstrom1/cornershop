ffmpeg -i video.mkv -c:v h264 -flags +cgop -g 30 -threads 0 -hls_segment_type fmp4 -hls_time 3 -hls_fmp4_init_filename init.mp4 -hls_playlist_type vod -hls_list_size 0 -hls_segment_filename "paradise%d.mp4" out.m3u8

