package user

import (
	"database/sql"
	"encoding/json"
	"fmt"

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

func FavoritedGame(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Wrong api call", http.StatusBadRequest)
		return
	}

	var favGame FavoriteRequest

	if err := json.NewDecoder(r.Body).Decode(&favGame); err != nil {
		fmt.Println(err)
		http.Error(w, "could not parse body", http.StatusInternalServerError)
		return
	}

	_, err := db.Exec(`INSERT INTO user_favorites (user_id, game_id) VALUES ($1,$2)`, favGame.UserID, favGame.GameID)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "falied to do insertion", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(favGame)

}

func FetchAllUsers(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		http.Error(w, "Wrong api call", http.StatusBadRequest)
		return
	}

	rows, err := db.Query(`SELECT u.id, u.username, u.points, g.id AS game_id,
	 g.game_name 
	FROM users u 
	LEFT JOIN user_favorites uf ON u.id = uf.user_id 
	LEFT JOIN games g ON uf.game_id = g.id `)

	if err != nil {
		fmt.Println(err)

		http.Error(w, "Failed to fetch games", http.StatusInternalServerError)
		return

	}

	defer rows.Close()
	// var rcvdUser ReceivedUser
	rcvdUser := make(map[int]*ReceivedUser)

	var order []int
	// var userList []ReceivedUser
	for rows.Next() {
		var uid int
		var uname string
		var upoints int
		var gid sql.NullInt64
		var gname sql.NullString

		if err := rows.Scan(&uid, &uname, &upoints, &gid, &gname); err != nil {
			fmt.Println(err)
			http.Error(w, "could not read row", http.StatusInternalServerError)
			return
		}

		u, exists := rcvdUser[uid]
		if !exists {
			u = &ReceivedUser{Id: uid, UName: uname, Upoints: upoints, Favorites: []*FavoriteGame{}}
			rcvdUser[uid] = u
			order = append(order, uid)
		}
		if gid.Valid {
			u.Favorites = append(u.Favorites, &FavoriteGame{ID: int(gid.Int64), GameName: gname.String})
		}

		if err := rows.Err(); err != nil {
			fmt.Println(err)
			http.Error(w, "error iterating rows", http.StatusInternalServerError)
			return
		}
	}

	userList := make([]*ReceivedUser, 0, len(order))
	for _, id := range order {
		userList = append(userList, rcvdUser[id])
	}
	json.NewEncoder(w).Encode(userList)

}
