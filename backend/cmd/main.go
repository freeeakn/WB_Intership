package main

import (
	"backend/internal/db"
	"backend/internal/handlers"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	maxRetries := 10
	for i := 0; i < maxRetries; i++ {
		err := db.InitDB(dsn)
		if err == nil {
			break
		}
		log.Printf("Failed to connect to database (attempt %d/%d): %v", i+1, maxRetries, err)
		time.Sleep(5 * time.Second)
		if i == maxRetries-1 {
			log.Fatal("Max retries reached, failed to connect to database")
		}
	}
	defer db.CloseDB()

	r := mux.NewRouter()

	// Regions endpoints
	r.HandleFunc("/regions", handlers.GetRegions).Methods("GET")
	r.HandleFunc("/regions", handlers.CreateRegion).Methods("POST")
	r.HandleFunc("/regions/{id}", handlers.GetRegion).Methods("GET")
	r.HandleFunc("/regions/{id}", handlers.UpdateRegion).Methods("PUT")
	r.HandleFunc("/regions/{id}", handlers.DeleteRegion).Methods("DELETE")

	// Cities endpoints
	r.HandleFunc("/cities", handlers.GetCities).Methods("GET")
	r.HandleFunc("/cities", handlers.CreateCity).Methods("POST")
	r.HandleFunc("/cities/{id}", handlers.GetCity).Methods("GET")
	r.HandleFunc("/cities/{id}", handlers.UpdateCity).Methods("PUT")
	r.HandleFunc("/cities/{id}", handlers.DeleteCity).Methods("DELETE")
	r.HandleFunc("/cities/{id}/upload-image", handlers.UploadCityImage).Methods("POST")

	r.HandleFunc("/images/{id}", handlers.GetImage).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	srv := &http.Server{
		Handler:      handler,
		Addr:         ":8080",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Println("Server starting on :8080")
	log.Fatal(srv.ListenAndServe())
}
