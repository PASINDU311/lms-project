package controllers

import (
	"net/http"

	"lms-backend/config"
	"lms-backend/models"

	"github.com/gin-gonic/gin"
)

type EnrollCourseInput struct {
	CourseID uint    `json:"course_id" binding:"required"`
	Amount   float64 `json:"amount" binding:"required"`
}

// EnrollCourse — Student කෙනෙකු Course එකකට Enroll වීම සහ Payment එක Record කිරීම
func EnrollCourse(c *gin.Context) {
	var input EnrollCourseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	currentUserID := uint(userID.(float64))

	// 1. Course එක තියෙනවද බලන්න
	var course models.Course
	if err := config.DB.First(&course, input.CourseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	// 2. දැනටමත් Enroll වෙලාද බලන්න
	var existingEnrollment models.Enrollment
	err := config.DB.Where("user_id = ? AND course_id = ?", currentUserID, input.CourseID).First(&existingEnrollment).Error
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You are already enrolled in this course"})
		return
	}

	// 3. Enrollment record එක හදන්න
	enrollment := models.Enrollment{
		UserID:   currentUserID,
		CourseID: input.CourseID,
		Status:   "ACTIVE",
	}
	if err := config.DB.Create(&enrollment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process enrollment"})
		return
	}

	// 4. Payment record එක හදන්න
	payment := models.Payment{
		UserID:        currentUserID,
		CourseID:      input.CourseID,
		Amount:        input.Amount,
		PaymentMethod: "CARD",
		Status:        "SUCCESS",
		TransactionID: "TXN_MOCK_" + string(rune(currentUserID)) + "_" + string(rune(input.CourseID)),
	}
	config.DB.Create(&payment)

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Enrolled successfully",
		"enrollment": enrollment,
		"payment":    payment,
	})
}

// GetMyEnrollments — Logged-in Student ගේ Courses ලැයිස්තුව ලබාගැනීම
func GetMyEnrollments(c *gin.Context) {
	userID, _ := c.Get("user_id")
	currentUserID := uint(userID.(float64))

	var enrollments []models.Enrollment
	if err := config.DB.Preload("Course").Where("user_id = ?", currentUserID).Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch enrollments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"enrollments": enrollments})
}