package main

import (
	"fmt"
	"net/http"

	"lms-backend/config"
	"lms-backend/models"
)

func main() {
	// 1. Database එකට Connect වීම
	config.ConnectDatabase()

	// 2. GORM Auto-Migration (සියලුම Models වලට අනුව Tables සෑදීම)
	err := config.DB.AutoMigrate(
		&models.User{},
		&models.Course{},
		&models.Section{},
		&models.Lesson{},
		&models.Enrollment{},
		&models.Payment{},
	)

	if err != nil {
		fmt.Println("Migration Failed:", err)
	} else {
		fmt.Println("All Database Tables Migrated Successfully!")
	}

	// 3. Simple Test Endpoint
	http.HandleFunc("/api/test", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		fmt.Fprintln(w, "LMS Go Backend & Database Connected!")
	})

	fmt.Println("Server is running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}