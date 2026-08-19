package controllers

import (
	"net/http"

	"lms-backend/config"
	"lms-backend/models"

	"github.com/gin-gonic/gin"
)

// Toggle or Mark Lesson as Completed
func CompleteLesson(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access / Invalid User"})
		return
	}

	var input struct {
		LessonID uint `json:"lesson_id" binding:"required"`
		CourseID uint `json:"course_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var progress models.LessonProgress
	err := config.DB.Where("user_id = ? AND lesson_id = ?", userID, input.LessonID).First(&progress).Error

	if err == nil {
		// Already marked, delete to uncheck
		config.DB.Unscoped().Delete(&progress)
		c.JSON(http.StatusOK, gin.H{"message": "Marked as incomplete", "is_done": false})
		return
	}

	// Create new progress entry
	newProgress := models.LessonProgress{
		UserID:   userID,
		LessonID: input.LessonID,
		CourseID: input.CourseID,
		IsDone:   true,
	}

	if err := config.DB.Create(&newProgress).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update progress"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Marked as completed", "is_done": true})
}

// Get User's Progress for a Specific Course
func GetCourseProgress(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access / Invalid User"})
		return
	}

	courseID := c.Param("course_id")

	var completedLessons []models.LessonProgress
	config.DB.Where("user_id = ? AND course_id = ?", userID, courseID).Find(&completedLessons)

	completedIDs := []uint{}
	for _, p := range completedLessons {
		completedIDs = append(completedIDs, p.LessonID)
	}

	c.JSON(http.StatusOK, gin.H{
		"completed_lesson_ids": completedIDs,
	})
}