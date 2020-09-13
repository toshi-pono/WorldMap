package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "3000"
	}
	http.HandleFunc("/", getSetting)
	http.HandleFunc("/view", getView)

	log.Printf("Server listening on port %s", port)
	log.Print(http.ListenAndServe(":"+port, nil))
}

func getSetting(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "hello")
}

func getView(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "view")
}
