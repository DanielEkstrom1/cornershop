package main

import (
	"encoding/hex"
	"log"
	"net/http"
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
		next.ServeHTTP(w, r)
	})
}
func Loggin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
		log.Println("Request", r.Method, r.URL.Path)
	})
}
