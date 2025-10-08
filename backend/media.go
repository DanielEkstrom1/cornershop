package main

import (
	cornershopdb "baller/cornershop/cornershop"
	"encoding/json"
	"io"
	"net/http"
)

func ListEpisodes(w http.ResponseWriter, r *http.Request) {
	store := cornershopdb.New(db)
	episodes, err := store.ListEpisodes(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(episodes)
}

func Playing(w http.ResponseWriter, r *http.Request) {
	id := r.Context().Value("id").(string)
	store := cornershopdb.New(db)
	if err := store.UpdatePlayingSession(r.Context(), cornershopdb.UpdatePlayingSessionParams{
		Playing: true,
		Device:  id,
	}); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func Stopped(w http.ResponseWriter, r *http.Request) {
	id := r.Context().Value("id").(string)
	store := cornershopdb.New(db)
	if err := store.UpdatePlayingSession(r.Context(), cornershopdb.UpdatePlayingSessionParams{
		Playing: false,
		Device:  id,
	}); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func Playback(w http.ResponseWriter, r *http.Request) {
	id := r.Context().Value("id").(string)
	store := cornershopdb.New(db)
	var params cornershopdb.UserSession
	if params, err = store.GetPlayback(r.Context(), id); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}

	if err := json.NewEncoder(w).Encode(params); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
	}
}

func Session(w http.ResponseWriter, r *http.Request) {
	var params cornershopdb.UpdateSessionParams
	id := r.Context().Value("id").(string)
	params.Device = id
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		if err != io.EOF {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
	}
	store := cornershopdb.New(db)
	if err := store.UpdateSession(r.Context(), params); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}
}

func Kill(w http.ResponseWriter, r *http.Request) {
	store := cornershopdb.New(db)

	var params cornershopdb.UpdateSessionParams
	id := r.Context().Value("id").(string)
	params.Device = id
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		if err != io.EOF {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
	}

	if err := store.UpdateSession(r.Context(), params); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}

	if client, ok := hub.clients[id]; ok {
		client.donech <- struct{}{}
	}
}

func Seek(w http.ResponseWriter, r *http.Request) {
	//store := cornershopdb.New(db)
}
