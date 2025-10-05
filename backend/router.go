package main

import "net/http"

func HydrateRouter(router *http.ServeMux) {
	router.HandleFunc("/video/", ServeTranscodedFile)
	router.HandleFunc("/video/main.m3u8", ServePlaylistFile) 
	router.HandleFunc("/media/list", ListEpisodes)
}
