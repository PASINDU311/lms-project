package controllers

import (
	"fmt"
	"net/http"
	"strings"

	"lms-backend/config"
	"lms-backend/models"

	"github.com/gin-gonic/gin"
)

type CreateCourseInput struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
}

type UpdateCourseInput struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Status      string  `json:"status"`
}

// Simple helper function to generate slug without external packages
func generateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	return slug
}

func CreateCourse(c *gin.Context) {
	var input CreateCourseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	instructorID := uint(userID.(float64))

	baseSlug := generateSlug(input.Title)
	slugName := fmt.Sprintf("%s-%d", baseSlug, strings.Count(baseSlug, "")+int(instructorID))

	course := models.Course{
		Title:        input.Title,
		Slug:         slugName,
		Description:  input.Description,
		Price:        input.Price,
		InstructorID: instructorID,
		Status:       "DRAFT",
	}

	if err := config.DB.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create course"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Course created successfully", "course": course})
}

func GetCourses(c *gin.Context) {
	var courses []models.Course
	if err := config.DB.Preload("Instructor").Preload("Sections.Lessons").Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"courses": courses})
}

func GetCourseByID(c *gin.Context) {
	id := c.Param("id")
	var course models.Course
	if err := config.DB.Preload("Instructor").Preload("Sections.Lessons").First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"course": course})
}

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

	if userRole != string(models.RoleAdmin) && course.InstructorID != currentUserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own courses"})
		return
	}

	var input UpdateCourseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	course.Title = input.Title
	course.Description = input.Description
	course.Price = input.Price
	if input.Status != "" {
		course.Status = input.Status
	}
	if input.Title != "" {
		course.Slug = generateSlug(input.Title)
	}

	config.DB.Save(&course)
	c.JSON(http.StatusOK, gin.H{"message": "Course updated successfully", "course": course})
}

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