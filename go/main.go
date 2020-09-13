package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

// WebSocket サーバーにつなぎにいくクライアント
var clients = make(map[*websocket.Conn]bool)

// クライアントから受け取るメッセージを格納
var broadcast = make(chan Message)

// WebSocket 更新用
var upgrader = websocket.Upgrader{}

type Message struct {
	DataType string `json:DataType`
	ObjType  string `json:ObjType`
}

// クライアントのハンドラ
func HandleClients(w http.ResponseWriter, r *http.Request) {
	// websocket の状態を更新
	websocket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal("error upgrading GET request to a websocket::", err)
	}
	defer websocket.Close()

	clients[websocket] = true

	for {
		var message Message
		err := websocket.ReadJSON(&message)
		fmt.Println(message)
		if err != nil {
			log.Printf("error occurred while reading message: %v", err)
			delete(clients, websocket)
			break
		}
		broadcast <- message
	}
}

func main() {
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "3000"
	}
	http.HandleFunc("/", HandleClients)
	http.HandleFunc("/status", statusOnServer)

	log.Println("Server Starting... PORT:", port)
	go broadcastMessagesToClients()
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal("error starting http server::", err)
		return
	}
}

func broadcastMessagesToClients() {
	log.Println("broadcastMessageToClients is run")
	for {
		message := <-broadcast
		for client := range clients {
			err := client.WriteJSON(message)
			if err != nil {
				log.Printf("error occurred while writing message to client: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func statusOnServer(w http.ResponseWriter, r *http.Request) {
	for client := range clients {
		log.Println(client)
	}
	fmt.Fprintln(w, "server is Runing")
	return
}
