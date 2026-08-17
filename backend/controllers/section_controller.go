package controllers

import (
	"net/http"

	"lms-backend/config"
	"lms-backend/models"

	"github.com/gin-gonic/gin"
)

type CreateSectionInput struct {
	CourseID uint   `json:"course_id" binding:"required"`
	Title    string `json:"title" binding:"required"`
	Order    int    `json:"order"`
}

type CreateLessonInput struct {
	SectionID   uint   `json:"section_id" binding:"required"`
	Title       string `json:"title" binding:"required"`
	ContentType string `json:"content_type"`
	VideoURL    string `json:"video_url"`
	Content     string `json:"content"`
	IsFree      bool   `json:"is_free"`
	Order       int    `json:"order"`
}

func CreateSection(c *gin.Context) {
	var input CreateSectionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var course models.Course
	if err := config.DB.First(&course, input.CourseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	section := models.Section{
		CourseID: input.CourseID,
		Title:    input.Title,
		Order:    input.Order,
	}

	if err := config.DB.Create(&section).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create section"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Section created successfully", "section": section})
}

func CreateLesson(c *gin.Context) {
	var input CreateLessonInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var section models.Section
	if err := config.DB.First(&section, input.SectionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Section not found"})
		return
	}

	lesson := models.Lesson{
		SectionID:   input.SectionID,
		Title:       input.Title,
		ContentType: input.ContentType,
		VideoURL:    input.VideoURL,
		Content:     input.Content,
		IsFree:      input.IsFree,
		Order:       input.Order,
	}

	if err := config.DB.Create(&lesson).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create lesson"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Lesson created successfully", "lesson": lesson})
}