package user

import (
	"time"
)

type User struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  string    `json:"password,omitempty"`
	Points    int       `json:"points"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserList struct {
	UserStack []*User `json:"users_list"`
}

type FavoriteRequest struct {
	UserID int `json:"user_id"`
	GameID int `json:"game_id"`
}

type FavoriteGame struct {
	ID       int    `json:"id"`
	GameName string `json:"game_name"`
}

type ReceivedUser struct {
	Id      int
	UName   string
	Upoints int
	// Game_Id   *int    `json:"game_id"`
	// Game_Name *string `json:"game_name"`
	Favorites []*FavoriteGame `json:"favorites"`
}
