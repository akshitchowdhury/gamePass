package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Overload()
	if err != nil {
		log.Println("Warning: No .env file found, using system environment variables")
	}

	connStr := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)
	// connStr := "host=localhost user=postgres password=devashura dbname=gamePass port=5432 sslmode=disable"

	db, err := sql.Open("pgx", connStr)
	if err != nil {
		log.Fatal("failed to open db:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("failed to ping db:", err)
	}

	fmt.Println("connected to postgres!")
	exportHandlers(db)
	fmt.Println("listening on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}

}
