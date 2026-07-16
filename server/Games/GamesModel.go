package games

import (
	gamecategory "game_pass/GameCategory"
	gamestudio "game_pass/GameStudio"
	"time"
)

type Game struct {
	ID             int                   `json:"id"`
	GameName       string                `json:"game_name"`
	Studio         gamestudio.Studio     `json:"studio_name"`
	Category       gamecategory.Category `json:"category_name"`
	GamePrice      float64               `json:"game_price"`
	Offer          float64               `json:"offer,omitempty"`
	PurchasePoints int                   `json:"purchase_points,omitempty"`
	GameSummary    string                `json:"game_summary,omitempty"`
	CreatedAt      time.Time             `json:"created_at"`
	UpdatedAt      time.Time             `json:"updated_at"`
}

type CreateGameRequest struct {
	GameName       string  `json:"game_name"`
	StudioName     string  `json:"studio_name"`
	CategoryName   string  `json:"category_name"`
	GamePrice      float64 `json:"game_price"`
	Offer          float64 `json:"offer"`
	PurchasePoints int     `json:"purchase_points"`
	GameSummary    string  `json:"game_summary"`
}

type GameList struct {
	GameStack []*CreateGameRequest `json:"games"`
}

type OgList struct {
	GameStack []*Game `json:"games"`
}

type BulkInsertResponse struct {
	InsertedCount int   `json:"inserted_count"`
	InsertedIDs   []int `json:"inserted_ids"`
}
