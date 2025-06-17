package handlers

import (
	"backend/internal/db"
	"context"
	"database/sql"
	"encoding/json"
	"io"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4"
)

func GetCities(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query(context.Background(), `
        SELECT c.id, c.name, c.region_id, c.distance_to_moscow, c.population, c.image_path, c.latitude, c.longitude, r.name as region_name
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
		err := rows.Scan(&city.ID, &city.Name, &city.RegionID, &city.DistanceToMoscow, &city.Population, &city.ImagePath, &city.Latitude, &city.Longitude, &city.RegionName)
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
	if r.Method == http.MethodPost && strings.HasPrefix(r.Header.Get("Content-Type"), "multipart/form-data") {
		err := r.ParseMultipartForm(10 << 20) // 10 MB limit
		if err != nil {
			http.Error(w, "Unable to parse form: "+err.Error(), http.StatusBadRequest)
			return
		}

		city := db.City{
			Name:       r.FormValue("name"),
			RegionID:   uint(mustParseInt(r.FormValue("region_id"))),
			Population: uint64(mustParseInt(r.FormValue("population"))),
			Latitude:   mustParseFloat(r.FormValue("latitude")),
			Longitude:  mustParseFloat(r.FormValue("longitude")),
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

		if city.Population == 0 {
			http.Error(w, "Population cannot be zero", http.StatusBadRequest)
			return
		}

		// Handle image upload
		file, handler, err := r.FormFile("image")
		var imagePath string
		if err == nil {
			defer file.Close()
			uploadDir := "/app/uploads"
			if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
				os.MkdirAll(uploadDir, 0755)
			}
			filename := filepath.Join(uploadDir, strconv.FormatUint(uint64(time.Now().UnixNano()), 10)+"_"+handler.Filename)
			dst, err := os.Create(filename)
			if err != nil {
				http.Error(w, "Unable to save file: "+err.Error(), http.StatusInternalServerError)
				return
			}
			defer dst.Close()
			_, err = io.Copy(dst, file)
			if err != nil {
				http.Error(w, "Unable to save file: "+err.Error(), http.StatusInternalServerError)
				return
			}
			imagePath = filename
		}

		// Calculate distance to Moscow
		moscowLat, moscowLon := 55.7558, 37.6173
		distance := calculateDistance(moscowLat, moscowLon, city.Latitude, city.Longitude)
		var newID uint
		err = db.DB.QueryRow(context.Background(), `
            INSERT INTO cities (name, region_id, distance_to_moscow, population, latitude, longitude, image_path)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
        `, city.Name, city.RegionID, distance, city.Population, city.Latitude, city.Longitude, sql.NullString{String: imagePath, Valid: imagePath != ""}).Scan(&newID)
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		city.ID = newID
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(city)
	} else {
		http.Error(w, "Use POST method with multipart/form-data Content-Type for city creation with image", http.StatusUnsupportedMediaType)
	}
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
        SELECT c.id, c.name, c.region_id, c.distance_to_moscow, c.population, c.image_path, c.latitude, c.longitude, r.name as region_name
        FROM cities c
        JOIN regions r ON c.region_id = r.id
        WHERE c.id = $1
    `, uint(id)).Scan(&city.ID, &city.Name, &city.RegionID, &city.DistanceToMoscow, &city.Population, &city.ImagePath, &city.Latitude, &city.Longitude, &regionName)
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
        SET name = $1, region_id = $2, distance_to_moscow = $3, population = $4, image_path = $5, latitude = $6, longitude = $7
        WHERE id = $8
        RETURNING id
    `, city.Name, city.RegionID, city.DistanceToMoscow, city.Population, imagePath, city.Latitude, city.Longitude, uint(id)).Scan(&updatedID)
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

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Unable to parse form: "+err.Error(), http.StatusBadRequest)
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
		http.Error(w, "Unable to save file: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {
		http.Error(w, "Unable to save file: "+err.Error(), http.StatusInternalServerError)
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

// New handler to serve images
func GetImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid city ID", http.StatusBadRequest)
		return
	}

	var imagePath sql.NullString
	err = db.DB.QueryRow(context.Background(), "SELECT image_path FROM cities WHERE id = $1", uint(id)).Scan(&imagePath)
	if err != nil {
		if err == pgx.ErrNoRows {
			http.Error(w, "City not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	if !imagePath.Valid {
		http.Error(w, "No image available", http.StatusNotFound)
		return
	}

	file, err := os.Open(imagePath.String)
	if err != nil {
		http.Error(w, "Unable to open image: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer file.Close()

	// Set content type based on file extension (basic detection)
	ext := filepath.Ext(imagePath.String)
	contentType := "application/octet-stream"
	switch ext {
	case ".jpg", ".jpeg":
		contentType = "image/jpeg"
	case ".png":
		contentType = "image/png"
	case ".gif":
		contentType = "image/gif"
	}

	w.Header().Set("Content-Type", contentType)
	http.ServeFile(w, r, imagePath.String)
}

func mustParseInt(s string) int {
	if s == "" {
		return 0
	}
	i, _ := strconv.Atoi(s)
	return i
}

func mustParseFloat(s string) float64 {
	if s == "" {
		return 0
	}
	f, _ := strconv.ParseFloat(s, 64)
	return f
}

func calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371 // Earth's radius in kilometers
	lat1Rad := degToRad(lat1)
	lon1Rad := degToRad(lon1)
	lat2Rad := degToRad(lat2)
	lon2Rad := degToRad(lon2)

	deltaLat := lat2Rad - lat1Rad
	deltaLon := lon2Rad - lon1Rad

	a := math.Sin(deltaLat/2)*math.Sin(deltaLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*math.Sin(deltaLon/2)*math.Sin(deltaLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}

func degToRad(deg float64) float64 {
	return deg * math.Pi / 180
}
