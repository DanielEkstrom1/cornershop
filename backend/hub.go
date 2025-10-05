package main

import (
	"log"
)

type Hub struct {
	clients    map[string]*Client
	register   chan *Client
	unregister chan *Client
	broadcast  chan []byte
}

func NewHub() *Hub {
	clients := make(map[string]*Client)
	registerch := make(chan *Client)
	unregisterch := make(chan *Client)
	boardcastch := make(chan []byte)
	return &Hub{
		clients:    clients,
		register:   registerch,
		unregister: unregisterch,
		broadcast:  boardcastch,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client.id] = client
			log.Printf("Welcome %s\n", client.id)
		case client := <-h.unregister:
			delete(h.clients, client.id)
			log.Printf("Goodbyte %s\n", client.id)
		case message := <-h.broadcast:
			for _, client := range h.clients {
				client.outbuf <- message

			}

		}
	}
}
