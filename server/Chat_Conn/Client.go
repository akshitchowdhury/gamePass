package chatconn

import (
	"context"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
	id   string
}
type Hub struct {
	clients    map[string]*Client
	mu         sync.RWMutex
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	ctx        context.Context
	cancel     context.CancelFunc
}

func newHub() *Hub {
	ctx, cancel := context.WithCancel(context.Background())
	return &Hub{
		clients:    make(map[string]*Client),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		ctx:        ctx,
		cancel:     cancel,
	}
}

func (h *Hub) Run() {

	for {
		select {
		case <-h.ctx.Done():
			h.mu.Lock()
			for _, client := range h.clients {
				close(client.send)
				h.clients = make(map[string]*Client)
				h.mu.Unlock()
			}
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.id] = client
			h.mu.Unlock()
		case client := <-h.unregister:

			h.mu.Lock()
			if _, ok := h.clients[client.id]; ok {
				delete(h.clients, client.id)
				close(client.send)
			}
			h.mu.Unlock()
		case message := <-h.broadcast:

			h.mu.Lock()

			for id, client := range h.clients {
				select {
				case client.send <- message:
				default:
					log.Printf("Client %s send buffer full, disconnecting", id)

					go func(c *Client) {
						h.unregister <- c
					}(client)

				}

			}
			h.mu.Unlock()
		}
	}
}
