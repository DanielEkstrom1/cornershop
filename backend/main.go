package main

import (
	"fmt"
	"log"
	"net/http"
	"path"
	"strings"

	"github.com/quic-go/quic-go/http3"
)

func init() {
	if err := checkFFmpeg(); err != nil {
		panic(err)
	}

	if err := checkFFProbe(); err != nil {
		panic(err)
	}
}
func main() {

	port := ":8080"
	router := http.NewServeMux()

	prober := Prober{}
	hls := Hls{Prober: prober, Directory: "../video"}

	router.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("hello endpoint\n")
		w.Write([]byte("hello from go"))
	})

	router.HandleFunc("/video/", func(w http.ResponseWriter, r *http.Request) {
		lst := strings.Split(r.URL.Path, "/")
		filename := lst[len(lst)-1]
		fmt.Println(filename)
		http.ServeFile(w, r, path.Join(hls.Directory, filename))
	})

	router.HandleFunc("/video/main.m3u8", func(w http.ResponseWriter, r *http.Request) {
		bytes, err := hls.GenPlaylist("../video/video.mkv")

		if err != nil {
			panic(err)
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
