package main

import (
	cornershopdb "baller/cornershop/cornershop"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	"github.com/quic-go/quic-go/http3"

	_ "embed"
)

func init() {
	if err := checkFFmpeg(); err != nil {
		panic(err)
	}

	if err := checkFFProbe(); err != nil {
		panic(err)
	}
}

//go:embed schema.sql
var ddl string

var (
	db  *sql.DB
	err error
)

func main() {
	ctx := context.Background()
	os.Remove("foo.db")

	db, err = sql.Open("sqlite3", "./foo.db")

	if err != nil {
		panic(err)
	}

	if _, err := db.ExecContext(ctx, ddl); err != nil {
		panic(err)
	}

	lib := NewLibrarian("../media")
	err = lib.ScanLibrary()
	if err != nil {
		panic(err)
	}

	store := cornershopdb.New(db)
	epi, _ := store.ListEpisodes(context.Background())
	fmt.Printf("%v\n", epi)

	port := ":8080"
	router := http.NewServeMux()

	prober := Prober{}
	hls := Hls{Prober: prober, Directory: "../media"}

	router.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("hello endpoint\n")
		w.Write([]byte("hello from go"))
	})

	router.HandleFunc("/video/", func(w http.ResponseWriter, r *http.Request) {
		lst := strings.Split(r.URL.Path, "/")
		filename := lst[len(lst)-1]
		fmt.Println(filename)

		if _, err := os.Stat(filename); errors.Is(err, os.ErrNotExist) {
			w.WriteHeader(404)
			w.Write([]byte("Not Found"))
			return
		}
		http.ServeFile(w, r, path.Join(hls.Directory, filename))
	})

	router.HandleFunc("/media/list", func(w http.ResponseWriter, r *http.Request) {
		store := cornershopdb.New(db)
		episodes, err := store.ListEpisodes(r.Context())

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(episodes)
	})

	router.HandleFunc("/video/main.m3u8", func(w http.ResponseWriter, r *http.Request) {
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
		w.WriteHeader(200)
		w.Write(bytes)
	})

	log.Printf("Serving in %s\n", port)
	log.Fatal(http3.ListenAndServeTLS(port, "cert.pem", "key.pem", Loggin(router)))
}

func Loggin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
		log.Println("Request", r.Method, r.URL.Path)
	})
}
