package main

import (
	"context"
	"crypto/sha1"
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
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
	db       *sql.DB
	err      error
	hasher   = sha1.New()
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	prober = Prober{}
	hls    = Hls{Prober: prober, MkvDir: "../media", OutDir: "../transcodes"}
	hub    = NewHub()
)

func init() {
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
}

func main() {
	port := ":8080"
	router := http.NewServeMux()
	go hub.Run()
	router.HandleFunc("/socket", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})
	HydrateRouter(router)
	log.Printf("Serving in %s\n", port)
	log.Fatal(http3.ListenAndServeTLS(port, "cert.pem", "key.pem", Cookie(Loggin(router))))
}
