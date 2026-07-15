package gamestudio

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func HandlePushStudio(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Wrong api call", http.StatusBadRequest)
		return
	}

	var insertedIds []int
	var stList StudioList
	if err := json.NewDecoder(r.Body).Decode(&stList); err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to parse body", http.StatusInternalServerError)
		return
	}

	tx, err := db.Begin()

	if err != nil {
		http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
		return
	}

	for _, g := range stList.StudioStack {
		var id int
		err := tx.QueryRow("INSERT INTO studios (studio_name) VALUES ($1) RETURNING id", g.StudioName).Scan(&id)

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

	json.NewEncoder(w).Encode(BulkStudioResponse{IdCounts: len(insertedIds), InsertedIDs: insertedIds})

}
