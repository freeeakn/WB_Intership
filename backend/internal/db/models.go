package db

import "database/sql"

type Region struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type City struct {
	ID               uint           `json:"id"`
	Name             string         `json:"name"`
	RegionID         uint           `json:"region_id"`
	DistanceToMoscow float64        `json:"distance_to_moscow"`
	Population       uint64         `json:"population"`
	ImagePath        sql.NullString `json:"image_path,omitempty"`
	Latitude         float64        `json:"latitude"`
	Longitude        float64        `json:"longitude"`
}
