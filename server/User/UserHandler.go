package user

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

func AddUser(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Wrong api call", http.StatusBadRequest)
		return
	}

	var newUser User

	if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil {
		http.Error(w, "could not parse user", http.StatusInternalServerError)
		return
	}
	var uId int
	err := db.QueryRow(`INSERT INTO users (username,email,password_hash,points) VALUES ($1,$2,$3,$4) RETURNING id`, newUser.Username,
		newUser.Email, newUser.Password, newUser.Points).Scan(&uId)
	if err != nil {
		http.Error(w, "Could not complete insertion", http.StatusInternalServerError)
		return
	}
	newUser.ID = uId
	json.NewEncoder(w).Encode(newUser)
}
