package gamecategory

type Category struct {
	ID           int    `json:"id"`
	CategoryName string `json:"category_name"`
}

type CategoryList struct {
	GameCatList []*Category `json:"game_category"`
}

type BulkCategoryResponse struct {
	InsertedCategoryCount int   `json:"inserted_count"`
	InsertedCatIds        []int `json:"inserted_ids"`
}
