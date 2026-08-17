package main

import (
	"fmt"
	"log"

	"lms-backend/config"
	"lms-backend/models"
	"lms-backend/routes"
)

func main() {
	// 1. Database එකට Connect වීම
	config.ConnectDatabase()

	// 2. GORM Auto-Migration
	err := config.DB.AutoMigrate(
		&models.User{},
		&models.Course{},
		&models.Section{},
		&models.Lesson{},
		&models.Enrollment{},
		&models.Payment{},
	)

	if err != nil {
		log.Fatal("Migration Failed: ", err)
	}
	fmt.Println("Database Migration Completed Successfully!")

	// 3. Gin Router එක Setup කර Run කිරීම
	r := routes.SetupRouter()

	fmt.Println("Server running on http://localhost:8080")
	r.Run(":8080")
}