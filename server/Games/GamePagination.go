package games

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strconv"

	// "encoding/json"
	// "fmt"
	"net/http"
	// "strconv"
)

func PaginateGames(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		http.Error(w, "Wrong apiCall", http.StatusBadRequest)
		return
	}

	paginationPart := r.URL.Query().Get("part")
	pageNo, err := strconv.Atoi(paginationPart)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Invalid id", http.StatusBadRequest)
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
	// var partGames map[int][]*Game

	parts := 5

	partSize := len(gameLsit.GameStack) / parts

	totalGames := len(gameLsit.GameStack)

	if pageNo < 1 || pageNo > parts {
		http.Error(w, "Page number out of range", http.StatusBadRequest)
		return
	}

	start := (pageNo - 1) * partSize
	end := start + partSize
	if pageNo == parts {
		end = totalGames // last page absorbs the remainder from integer division
	}

	paginatedGames := map[string]any{
		"page":     pageNo,
		"limit":    partSize,
		"gameList": gameLsit.GameStack[start:end],
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(paginatedGames)
}
