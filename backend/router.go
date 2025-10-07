package main

import "net/http"

func HydrateRouter(router *http.ServeMux) {
	publicRouter := http.NewServeMux()
	publicRouter.HandleFunc("/video/", ServeTranscodedFile)
	publicRouter.HandleFunc("/video/main.m3u8", ServePlaylistFile)
	publicRouter.HandleFunc("/media/list", ListEpisodes)
	publicRouter.HandleFunc("/session/Playing", Playing)
	publicRouter.HandleFunc("/session/Stopped", Stopped)
	publicRouter.HandleFunc("/session/Session", Session)
	publicRouter.HandleFunc("/session/Seek", Seek)
	publicRouter.HandleFunc("/session/Killed", Kill)
	publicRouter.HandleFunc("/session/Playback", Playback)
	router.Handle("/", Device(publicRouter))
}
