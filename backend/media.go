package main

import (
	cornershopdb "baller/cornershop/cornershop"
	"encoding/json"
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

}
func Stopped(w http.ResponseWriter, r *http.Request) {

}
func Session(w http.ResponseWriter, r *http.Request) {

}
func Seek(w http.ResponseWriter, r *http.Request)    {

}

