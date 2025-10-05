package main

import (
	cornershopdb "baller/cornershop/cornershop"
	"context"
	"encoding/hex"
	"log"
	"net/http"
	"time"
)

func Cookie(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hasher.Write([]byte(r.Host))
		sha1_hash := hex.EncodeToString(hasher.Sum(nil))
		hasher.Reset()
		cookie := &http.Cookie{
			Name:     "Device",
			Value:    sha1_hash,
			SameSite: http.SameSiteLaxMode,
			Path:     "/",
			Secure:   false,
			HttpOnly: true,
		}
		http.SetCookie(w, cookie)
		store := cornershopdb.New(db)
		var id string
		var err error
		if id, err = store.GetDevice(r.Context(), sha1_hash); err != nil {
			if id, err = store.CreateDevice(r.Context(), cornershopdb.CreateDeviceParams{
				ID:    sha1_hash,
				Agent: r.UserAgent(),
			}); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte(err.Error()))
				return
			}
			if err := store.CreateSession(r.Context(), cornershopdb.CreateSessionParams{
				Device:        id,
				AnimeTitle:    "",
				EpisodeNumber: "",
			}); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte(err.Error()))
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}

func Device(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var cookie *http.Cookie
		var err error

		if cookie, err = r.Cookie("Device"); err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(err.Error()))
			return
		}
		store := cornershopdb.New(db)
		id, err := store.GetDevice(r.Context(), cookie.Value)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(err.Error()))
			return
		}
		ctx := context.WithValue(r.Context(), "id", id)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func Loggin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s %s\n", r.RemoteAddr, r.Method, r.URL.Path, time.Since(start))
	})
}
