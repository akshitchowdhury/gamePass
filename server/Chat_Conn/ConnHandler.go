package chatconn

import (
	"log"
	"net/http"
	"os"

	// "github.com/google/uuid"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	clientId := uuid.New().String()
	client := &Client{
		hub:  hub,
		conn: conn,
		send: make(chan []byte, 256),
		id:   clientId,
	}

	go client.writePump()
	go client.readPump()

	hub.register <- client

}

func SocketConnectHandler() {

	hub := newHub()

	go hub.Run()
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})

	addr := ":8080"
	if port := os.Getenv("PORT"); port != "" {
		addr = ":" + port
	}

	log.Printf("WebSocket server starting on %s", addr)
	// if err := http.ListenAndServe(addr, nil); err != nil {
	// 	log.Fatal("ListenAndServe error:", err)
	// }
}
