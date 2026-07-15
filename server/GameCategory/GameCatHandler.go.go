package gamecategory

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
)

func HandlePushNewGameCategories(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "wrong api call", http.StatusBadRequest)
		return
	}

	var catList CategoryList
	var insertedIds []int
	if err := json.NewDecoder(r.Body).Decode(&catList); err != nil {
		http.Error(w, "Failed to parse in body", http.StatusInternalServerError)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, "could not start transaction", http.StatusInternalServerError)
		return
	}

	for _, g := range catList.GameCatList {
		var id int
		err := tx.QueryRow("INSERT INTO categories (category_name) VALUES ($1) RETURNING id", g.CategoryName).Scan(&id)

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

	json.NewEncoder(w).Encode(BulkCategoryResponse{InsertedCategoryCount: len(insertedIds), InsertedCatIds: insertedIds})
}
