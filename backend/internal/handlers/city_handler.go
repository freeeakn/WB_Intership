package handlers

import (
	"backend/internal/db"
	"context"
	"database/sql"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4"
)

func GetCities(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query(context.Background(), `
		SELECT c.id, c.name, c.region_id, c.distance_to_moscow, c.population, c.image_path, r.name as region_name
		FROM cities c
		JOIN regions r ON c.region_id = r.id
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var cities []struct {
		db.City
		RegionName string `json:"region_name"`
	}
	for rows.Next() {
		var city struct {
			db.City
			RegionName string `json:"region_name"`
		}
		err := rows.Scan(&city.ID, &city.Name, &city.RegionID, &city.DistanceToMoscow, &city.Population, &city.ImagePath, &city.RegionName)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		cities = append(cities, city)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cities)
}

func CreateCity(w http.ResponseWriter, r *http.Request) {
	var city db.City
	err := json.NewDecoder(r.Body).Decode(&city)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if city.Name == "" {
		http.Error(w, "City name is required", http.StatusBadRequest)
		return
	}

	if city.RegionID == 0 {
		http.Error(w, "Region ID is required", http.StatusBadRequest)
		return
	}

	var exists bool
	err = db.DB.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM regions WHERE id = $1)", city.RegionID).Scan(&exists)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !exists {
		http.Error(w, "Region not found", http.StatusNotFound)
		return
	}

	if city.DistanceToMoscow < 0 {
		http.Error(w, "Distance to Moscow cannot be negative", http.StatusBadRequest)
		return
	}

	if city.Population == 0 {
		http.Error(w, "Population cannot be zero", http.StatusBadRequest)
		return
	}

	var newID uint
	err = db.DB.QueryRow(context.Background(), `
		INSERT INTO cities (name, region_id, distance_to_moscow, population)
		VALUES ($1, $2, $3, $4) RETURNING id
	`, city.Name, city.RegionID, city.DistanceToMoscow, city.Population).Scan(&newID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	city.ID = newID
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(city)
}

func GetCity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid city ID", http.StatusBadRequest)
		return
	}

	var city db.City
	var regionName string
	err = db.DB.QueryRow(context.Background(), `
		SELECT c.id, c.name, c.region_id, c.distance_to_moscow, c.population, c.image_path, r.name as region_name
		FROM cities c
		JOIN regions r ON c.region_id = r.id
		WHERE c.id = $1
	`, uint(id)).Scan(&city.ID, &city.Name, &city.RegionID, &city.DistanceToMoscow, &city.Population, &city.ImagePath, &regionName)
	if err != nil {
		if err == pgx.ErrNoRows {
			http.Error(w, "City not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	response := struct {
		db.City
		RegionName string `json:"region_name"`
	}{city, regionName}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func UpdateCity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid city ID", http.StatusBadRequest)
		return
	}

	var city db.City
	err = json.NewDecoder(r.Body).Decode(&city)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if city.Name == "" {
		http.Error(w, "City name is required", http.StatusBadRequest)
		return
	}

	if city.RegionID == 0 {
		http.Error(w, "Region ID is required", http.StatusBadRequest)
		return
	}

	var exists bool
	err = db.DB.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM regions WHERE id = $1)", city.RegionID).Scan(&exists)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !exists {
		http.Error(w, "Region not found", http.StatusNotFound)
		return
	}

	if city.DistanceToMoscow < 0 {
		http.Error(w, "Distance to Moscow cannot be negative", http.StatusBadRequest)
		return
	}

	if city.Population == 0 {
		http.Error(w, "Population cannot be zero", http.StatusBadRequest)
		return
	}

	var updatedID uint
	var imagePath sql.NullString
	if city.ImagePath.Valid {
		imagePath = city.ImagePath
	} else {
		imagePath = sql.NullString{String: "", Valid: false}
	}
	err = db.DB.QueryRow(context.Background(), `
		UPDATE cities
		SET name = $1, region_id = $2, distance_to_moscow = $3, population = $4, image_path = $5
		WHERE id = $6
		RETURNING id
	`, city.Name, city.RegionID, city.DistanceToMoscow, city.Population, imagePath, uint(id)).Scan(&updatedID)
	if err != nil {
		if err == pgx.ErrNoRows {
			http.Error(w, "City not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	city.ID = updatedID
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(city)
}

func DeleteCity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid city ID", http.StatusBadRequest)
		return
	}

	var imagePath sql.NullString
	err = db.DB.QueryRow(context.Background(), "SELECT image_path FROM cities WHERE id = $1", uint(id)).Scan(&imagePath)
	if err == nil && imagePath.Valid {
		os.Remove(imagePath.String)
	}

	result, err := db.DB.Exec(context.Background(), "DELETE FROM cities WHERE id = $1", uint(id))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		http.Error(w, "City not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func UploadCityImage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseMultipartForm(10 << 20) // 10 MB limit
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "No image file uploaded", http.StatusBadRequest)
		return
	}
	defer file.Close()

	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid city ID", http.StatusBadRequest)
		return
	}

	uploadDir := "/app/uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.MkdirAll(uploadDir, 0755)
	}

	filename := filepath.Join(uploadDir, strconv.FormatUint(uint64(id), 10)+"_"+handler.Filename)
	dst, err := os.Create(filename)
	if err != nil {
		http.Error(w, "Unable to save file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {
		http.Error(w, "Unable to save file", http.StatusInternalServerError)
		return
	}

	_, err = db.DB.Exec(context.Background(), `
		UPDATE cities
		SET image_path = $1
		WHERE id = $2
	`, filename, uint(id))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Image uploaded successfully", "image_path": filename})
}
