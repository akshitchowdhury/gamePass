package user

import (
	"time"
)

type User struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	Points    int       `json:"points"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserList struct {
	UserStack []*User
}

type FavoriteRequest struct {
	UserID int `json:"user_id"`
	GameID int `json:"game_id"`
}
