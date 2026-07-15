package gamestudio

type Studio struct {
	ID         int    `json:"id"`
	StudioName string `json:"studio_name"`
}

type StudioList struct {
	StudioStack []*Studio `json:"game_studios"`
}

type BulkStudioResponse struct {
	IdCounts    int   `json:"id_counts"`
	InsertedIDs []int `json:"inserted_ids"`
}
