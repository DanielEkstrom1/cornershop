package main

import (
	cornershopdb "baller/cornershop/cornershop"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
)

func ServeTranscodedFile(w http.ResponseWriter, r *http.Request) {
	lst := strings.Split(r.URL.Path, "/")
	filename := lst[len(lst)-1]

	filepath := path.Join(hls.OutDir, filename)

	if _, err := os.Stat(filepath); errors.Is(err, os.ErrNotExist) {
		w.WriteHeader(404)
		w.Write([]byte("Not Found"))
		return
	}

	log.Printf("Serving file: %s\n", filepath)

	http.ServeFile(w, r, filepath)
}

func ServePlaylistFile(w http.ResponseWriter, r *http.Request) {
	store := cornershopdb.New(db)

	id := r.URL.Query().Get("id")

	fmt.Println(id)
	num, err := strconv.ParseInt(id, 10, 64)

	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	ep, err := store.GetEpisode(r.Context(), num)

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		log.Println(err)
		return
	}

	fmt.Println(ep.FileName)
	bytes, err := hls.GenPlaylist(ep.FileName)

	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	go hls.SegmentMKVToHLS(r.Context(), ep.FileName)

	w.WriteHeader(200)
	w.Write(bytes)
}
