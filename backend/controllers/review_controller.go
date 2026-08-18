package controllers

import (
	"net/http"

	"lms-backend/config"
	"lms-backend/models"

	"github.com/gin-gonic/gin"
)

// 1. Add or Update Course Review (Student)
func AddOrUpdateReview(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
		return
	}

	var input struct {
		CourseID uint   `json:"course_id" binding:"required"`
		Rating   int    `json:"rating" binding:"required,min=1,max=5"`
		Comment  string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Enrollment එක තියෙනවද බලන්න
	var enrollment models.Enrollment
	err := config.DB.Where("user_id = ? AND course_id = ?", userID, input.CourseID).First(&enrollment).Error
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You must be enrolled in this course to leave a review"})
		return
	}

	var existingReview models.Review
	err = config.DB.Where("course_id = ? AND user_id = ?", input.CourseID, userID).First(&existingReview).Error

	if err == nil {
		// Existing review update
		existingReview.Rating = input.Rating
		existingReview.Comment = input.Comment
		config.DB.Save(&existingReview)

		c.JSON(http.StatusOK, gin.H{"message": "Review updated successfully", "review": existingReview})
		return
	}

	// New review create
	review := models.Review{
		CourseID: input.CourseID,
		UserID:   userID,
		Rating:   input.Rating,
		Comment:  input.Comment,
	}

	if err := config.DB.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit review"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Review submitted successfully", "review": review})
}


// 2. Get Course Reviews & Average Rating (Public)
func GetCourseReviews(c *gin.Context) {
	courseID := c.Param("id") // `:course_id` වෙනුවට `:id`

	var reviews []models.Review
	if err := config.DB.Preload("User").Where("course_id = ?", courseID).Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}

	totalReviews := len(reviews)
	avgRating := 0.0

	if totalReviews > 0 {
		sum := 0
		for _, r := range reviews {
			sum += r.Rating
		}
		avgRating = float64(sum) / float64(totalReviews)
	}

	c.JSON(http.StatusOK, gin.H{
		"reviews":       reviews,
		"total_reviews": totalReviews,
		"avg_rating":    avgRating,
	})
}