package controllers

import (
	"net/http"

	"lms-backend/config"
	"lms-backend/models"

	"github.com/gin-gonic/gin"
)

type CreateCourseInput struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required"`
}

// CreateCourse — Instructor හෝ Admin විසින් නව Course එකක් සෑදීම
func CreateCourse(c *gin.Context) {
	var input CreateCourseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	// float64 මගින් එන user_id එක uint බවට පත් කිරීම
	instructorID := uint(userID.(float64))

	course := models.Course{
		Title:        input.Title,
		Description:  input.Description,
		Price:        input.Price,
		InstructorID: instructorID,
	}

	if err := config.DB.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create course"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Course created successfully",
		"course":  course,
	})
}

// GetCourses — පද්ධතියේ ඇති සියලුම Courses ලබාගැනීම (Public)
func GetCourses(c *gin.Context) {
	var courses []models.Course

	// Instructor ගේ විස්තර සහ Sections/Lessons එක්ක Load කිරීම
	if err := config.DB.Preload("Instructor").Preload("Sections.Lessons").Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"courses": courses})
}

// GetCourseByID — ID එක මගින් නිශ්චිත Course එකක විස්තර ලබාගැනීම
func GetCourseByID(c *gin.Context) {
	id := c.Param("id")
	var course models.Course

	if err := config.DB.Preload("Instructor").Preload("Sections.Lessons").First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"course": course})
}

type UpdateCourseInput struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
}

// UpdateCourse — Course එකක් Update කිරීම (Instructor/Admin)
func UpdateCourse(c *gin.Context) {
	id := c.Param("id")
	var course models.Course

	if err := config.DB.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("role")
	currentUserID := uint(userID.(float64))

	// Admin ට ඕනෑම course එකක් edit කල හැක, Instructor ට තමන්ගේම course පමණි
	if userRole != string(models.RoleAdmin) && course.InstructorID != currentUserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own courses"})
		return
	}

	var input UpdateCourseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Model(&course).Updates(models.Course{
		Title:       input.Title,
		Description: input.Description,
		Price:       input.Price,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Course updated successfully",
		"course":  course,
	})
}

// DeleteCourse — Course එකක් Delete කිරීම (Instructor/Admin)
func DeleteCourse(c *gin.Context) {
	id := c.Param("id")
	var course models.Course

	if err := config.DB.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("role")
	currentUserID := uint(userID.(float64))

	if userRole != string(models.RoleAdmin) && course.InstructorID != currentUserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own courses"})
		return
	}

	if err := config.DB.Delete(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully"})
}