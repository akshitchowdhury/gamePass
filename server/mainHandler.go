package main

import (
	"database/sql"
	gamecategory "game_pass/GameCategory"
	gamestudio "game_pass/GameStudio"
	games "game_pass/Games"
	user "game_pass/User"
	"net/http"
)

func WithCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent) // 204, nothing else to do
			return
		}

		next(w, r) // hand off to your actual handler
	}
}

func exportHandlers(db *sql.DB) {

	http.HandleFunc("/getAllGames", WithCORS(func(w http.ResponseWriter, r *http.Request) { games.HandleFetchAllGames(db, w, r) }))
	http.HandleFunc("/paginateGames", WithCORS(func(w http.ResponseWriter, r *http.Request) { games.PaginateGames(db, w, r) }))
	http.HandleFunc("/pushNewGames", WithCORS(func(w http.ResponseWriter, r *http.Request) { games.HandlePushNewGames(db, w, r) }))
	http.HandleFunc("/pushNewStudios", WithCORS(func(w http.ResponseWriter, r *http.Request) { gamestudio.HandlePushStudio(db, w, r) }))
	http.HandleFunc("/pushNewGameCat", WithCORS(func(w http.ResponseWriter, r *http.Request) { gamecategory.HandlePushNewGameCategories(db, w, r) }))

}
func exportUserHandlers(db *sql.DB) {

	http.HandleFunc("/addUser", WithCORS(func(w http.ResponseWriter, r *http.Request) { user.AddUser(db, w, r) }))
	http.HandleFunc("/favGame", WithCORS(func(w http.ResponseWriter, r *http.Request) { user.FavoritedGame(db, w, r) }))
	http.HandleFunc("/getAllUsers", WithCORS(func(w http.ResponseWriter, r *http.Request) { user.FetchAllUsers(db, w, r) }))

}
