package main

import (
	"fmt"
	"log"
	"net/http"
	"os/exec"

	"github.com/gorilla/websocket"
)

type Client struct {
	hub    *Hub
	conn   *websocket.Conn
	outbuf chan []byte
	id     string
	cmd    *exec.Cmd
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
		if msg == nil {
			return
		}
		c.conn.WriteMessage(websocket.TextMessage, msg)
	}
}

func (c *Client) read() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		messageType, p, err := c.conn.ReadMessage()

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			if websocket.IsCloseError(err, websocket.CloseGoingAway) {
				return
			}
			fmt.Printf("Err: %s\n", err)
			return
		}

		switch messageType {
		case websocket.CloseMessage:
			c.outbuf <- nil
			return
		case websocket.TextMessage:
			if err := c.conn.WriteMessage(messageType, p); err != nil {
				log.Println(err)
				return
			}
		}
	}

}
