package games

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	// "time"
)

// func HandleFetchAllGames(w http.ResponseWriter, r *http.Request){

// }

func HandleFetchAllGames(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		http.Error(w, "Wrong apiCall", http.StatusBadRequest)
		return
	}

	var gameLsit OgList

	// if err := json.NewDecoder(r.Body).Decode(&gameLsit); err != nil {
	// 	fmt.Println(err)
	// 	http.Error(w, "cannot fetch the list", http.StatusInternalServerError)
	// 	return
	// }

	rows, err := db.Query(`SELECT g.id, g.game_name,
				s.id, s.studio_name,
				c.id, c.category_name,
				g.game_price, g.offer, g.purchase_points, g.game_summary,
				g.created_at, g.updated_at
			FROM games g
			JOIN studios s ON g.studio_id = s.id
			JOIN categories c ON g.category_id = c.id`)

	if err != nil {
		http.Error(w, "Failed to fetch games", http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	for rows.Next() {
		var g Game

		err := rows.Scan(&g.ID, &g.GameName,
			&g.Studio.ID, &g.Studio.StudioName,
			&g.Category.ID, &g.Category.CategoryName,
			&g.GamePrice, &g.Offer, &g.PurchasePoints, &g.GameSummary,
			&g.CreatedAt, &g.UpdatedAt)

		if err != nil {
			http.Error(w, "Failed to read game row", http.StatusInternalServerError)
			return
		}

		gameLsit.GameStack = append(gameLsit.GameStack, &g)

	}

	if err := rows.Err(); err != nil { // catches errors during iteration itself
		http.Error(w, "Error iterating game rows", http.StatusInternalServerError)
		return
	}
	// var partGames OgList

	// for _, game := range gameLsit.GameStack[:len(gameLsit.GameStack)/2] {
	// 	partGames.GameStack = append(partGames.GameStack, game)
	// }

	// fmt.Println(partGames)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(gameLsit)
}

func HandlePushNewGames(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Wrong method called", http.StatusBadRequest)
		return
	}

	// var game Game

	var gameList GameList

	var insertedIds []int

	if err := json.NewDecoder(r.Body).Decode(&gameList); err != nil {
		fmt.Println(err)
		http.Error(w, "Cannot parse in games", http.StatusInternalServerError)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, "could not start transaction", http.StatusInternalServerError)
		return
	}

	for _, g := range gameList.GameStack {
		var studioID, categoryID, id int

		err := tx.QueryRow(`SELECT id FROM categories WHERE category_name = $1`, g.CategoryName).Scan(&categoryID)
		if err != nil {
			tx.Rollback()
			http.Error(w, "category not found: "+g.CategoryName, http.StatusBadRequest)
			return
		}

		err = tx.QueryRow(`SELECT id FROM studios WHERE studio_name = $1`, g.StudioName).Scan(&studioID)
		if err != nil {
			tx.Rollback()
			http.Error(w, "studio not found: "+g.StudioName, http.StatusBadRequest)
			return
		}

		err = tx.QueryRow(
			`INSERT INTO games (game_name, studio_id, category_id, game_price, offer, purchase_points, game_summary)
		 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
			g.GameName, studioID, categoryID, g.GamePrice, g.Offer, g.PurchasePoints, g.GameSummary,
		).Scan(&id)

		if err != nil {
			tx.Rollback()
			log.Println("insert failed:", err)
			http.Error(w, "Failed RollBacks", http.StatusInternalServerError)
			return
		}
		insertedIds = append(insertedIds, id)
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "failed to commit transaction", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(BulkInsertResponse{InsertedIDs: insertedIds, InsertedCount: len(insertedIds)})

}
