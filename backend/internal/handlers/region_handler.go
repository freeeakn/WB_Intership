package handlers

import (
	"backend/internal/db"
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4"
)

func GetRegions(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query(context.Background(), "SELECT id, name FROM regions")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var regions []db.Region
	for rows.Next() {
		var region db.Region
		err := rows.Scan(&region.ID, &region.Name)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		regions = append(regions, region)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(regions)
}

func CreateRegion(w http.ResponseWriter, r *http.Request) {
	var region db.Region
	err := json.NewDecoder(r.Body).Decode(&region)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if region.Name == "" {
		http.Error(w, "Region name is required", http.StatusBadRequest)
		return
	}

	var newID uint
	err = db.DB.QueryRow(context.Background(), "INSERT INTO regions (name) VALUES ($1) RETURNING id", region.Name).Scan(&newID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	region.ID = newID
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(region)
}

func GetRegion(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid region ID", http.StatusBadRequest)
		return
	}

	var region db.Region
	err = db.DB.QueryRow(context.Background(), "SELECT id, name FROM regions WHERE id = $1", uint(id)).Scan(&region.ID, &region.Name)
	if err != nil {
		if err == pgx.ErrNoRows {
			http.Error(w, "Region not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(region)
}

func UpdateRegion(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid region ID", http.StatusBadRequest)
		return
	}

	var region db.Region
	err = json.NewDecoder(r.Body).Decode(&region)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if region.Name == "" {
		http.Error(w, "Region name is required", http.StatusBadRequest)
		return
	}

	var updatedID uint
	err = db.DB.QueryRow(context.Background(), "UPDATE regions SET name = $1 WHERE id = $2 RETURNING id", region.Name, uint(id)).Scan(&updatedID)
	if err != nil {
		if err == pgx.ErrNoRows {
			http.Error(w, "Region not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	region.ID = updatedID
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(region)
}

func DeleteRegion(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid region ID", http.StatusBadRequest)
		return
	}

	result, err := db.DB.Exec(context.Background(), "DELETE FROM regions WHERE id = $1", uint(id))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		http.Error(w, "Region not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
