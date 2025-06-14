package db

import (
	"context"

	"github.com/jackc/pgx/v4/pgxpool"
)

var DB *pgxpool.Pool

func InitDB(dataSourceName string) error {
	var err error
	DB, err = pgxpool.Connect(context.Background(), dataSourceName)
	if err != nil {
		return err
	}
	return nil
}

func CloseDB() {
	DB.Close()
}
