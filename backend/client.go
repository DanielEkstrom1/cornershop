package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Client struct {
	hub    *Hub
	conn   *websocket.Conn
	outbuf chan []byte
	id     string
}

func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	var cookie *http.Cookie
	var err error

	if cookie, err = r.Cookie("Device"); err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	c := &Client{id: cookie.Value, hub: hub, conn: conn, outbuf: make(chan []byte)}

	c.hub.register <- c

	go c.write()
	go c.read()

}

func (c *Client) write() {
	for {
		msg := <-c.outbuf
		c.conn.WriteMessage(websocket.TextMessage, msg)
	}
}

func (c *Client) read() {
	for {
		messageType, p, err := c.conn.ReadMessage()

		if err != nil {
			log.Println(err)
			return
		}
		switch messageType {
		case websocket.CloseMessage:
			c.hub.unregister <- c
		case websocket.TextMessage:
			if err := c.conn.WriteMessage(messageType, p); err != nil {
				log.Println(err)
				return
			}
		}
	}

}
