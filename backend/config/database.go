package config

import (
	"fmt"
	"log"
	"os"

	"lms-backend/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// Quiz Models ටික AutoMigrate එකට එකතු කළා
	err = database.AutoMigrate(
		&models.User{},
		&models.Course{},
		&models.Section{},
		&models.Lesson{},
		&models.Enrollment{},
		&models.Payment{},
		&models.LessonProgress{},
		&models.Quiz{},
		&models.Question{},
		&models.Option{},
		&models.QuizResult{},
	)
	if err != nil {
		log.Println("Failed to auto migrate database models:", err)
	}

	DB = database
	fmt.Println("Database connection successfully established!")
}