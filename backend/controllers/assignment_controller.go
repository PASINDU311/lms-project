package controllers

import (
	"net/http"
	"time"

	"lms-backend/config"
	"lms-backend/models"

	"github.com/gin-gonic/gin"
)

// 1. Create Assignment (Instructor Only)
func CreateAssignment(c *gin.Context) {
	var input struct {
		SectionID   uint       `json:"section_id" binding:"required"`
		Title       string     `json:"title" binding:"required"`
		Description string     `json:"description" binding:"required"`
		MaxMarks    float64    `json:"max_marks"`
		DueDate     *time.Time `json:"due_date"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.MaxMarks <= 0 {
		input.MaxMarks = 100.0
	}

	assignment := models.Assignment{
		SectionID:   input.SectionID,
		Title:       input.Title,
		Description: input.Description,
		MaxMarks:    input.MaxMarks,
		DueDate:     input.DueDate,
	}

	if err := config.DB.Create(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create assignment"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Assignment created successfully", "assignment": assignment})
}

// 2. Get Assignments by Section ID (Student & Instructor)
func GetAssignmentsBySection(c *gin.Context) {
	sectionID := c.Param("section_id")

	var assignments []models.Assignment
	if err := config.DB.Where("section_id = ?", sectionID).Find(&assignments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assignments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"assignments": assignments})
}

// 3. Submit Assignment (Student)
func SubmitAssignment(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
		return
	}

	var input struct {
		AssignmentID  uint   `json:"assignment_id" binding:"required"`
		SubmissionURL string `json:"submission_url"`
		Content       string `json:"content"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existingSubmission models.AssignmentSubmission
	err := config.DB.Where("assignment_id = ? AND user_id = ?", input.AssignmentID, userID).First(&existingSubmission).Error

	if err == nil {
		// Update existing submission
		existingSubmission.SubmissionURL = input.SubmissionURL
		existingSubmission.Content = input.Content
		existingSubmission.Status = "SUBMITTED"
		config.DB.Save(&existingSubmission)

		c.JSON(http.StatusOK, gin.H{"message": "Submission updated successfully", "submission": existingSubmission})
		return
	}

	submission := models.AssignmentSubmission{
		AssignmentID:  input.AssignmentID,
		UserID:        userID,
		SubmissionURL: input.SubmissionURL,
		Content:       input.Content,
		Status:        "SUBMITTED",
	}

	if err := config.DB.Create(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit assignment"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Assignment submitted successfully", "submission": submission})
}

// 4. Grade Submission (Instructor Only)
func GradeAssignment(c *gin.Context) {
	submissionID := c.Param("submission_id")

	var input struct {
		Marks    float64 `json:"marks" binding:"required"`
		Feedback string  `json:"feedback"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var submission models.AssignmentSubmission
	if err := config.DB.First(&submission, submissionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Submission not found"})
		return
	}

	submission.Marks = &input.Marks
	submission.Feedback = input.Feedback
	submission.Status = "GRADED"

	config.DB.Save(&submission)

	c.JSON(http.StatusOK, gin.H{"message": "Assignment graded successfully", "submission": submission})
}

// 5. Get Submissions for an Assignment (Instructor Only)
func GetAssignmentSubmissions(c *gin.Context) {
	assignmentID := c.Param("assignment_id")

	var submissions []models.AssignmentSubmission
	if err := config.DB.Preload("User").Where("assignment_id = ?", assignmentID).Find(&submissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch submissions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"submissions": submissions})
}

// 6. Get Logged-in Student's Submission for an Assignment (Student View) 🔥 NEW
func GetMySubmission(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
		return
	}

	assignmentID := c.Param("assignment_id")

	var submission models.AssignmentSubmission
	err := config.DB.Where("assignment_id = ? AND user_id = ?", assignmentID, userID).First(&submission).Error
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"submission": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"submission": submission})
}

// 7. Update Assignment (Instructor / Admin)
func UpdateAssignment(c *gin.Context) {
	assignmentID := c.Param("id")

	var assignment models.Assignment
	if err := config.DB.First(&assignment, assignmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found"})
		return
	}

	var input struct {
		Title       string     `json:"title"`
		Description string     `json:"description"`
		MaxMarks    float64    `json:"max_marks"`
		DueDate     *time.Time `json:"due_date"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	assignment.Title = input.Title
	assignment.Description = input.Description
	if input.MaxMarks > 0 {
		assignment.MaxMarks = input.MaxMarks
	}
	assignment.DueDate = input.DueDate

	if err := config.DB.Save(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update assignment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Assignment updated successfully", "assignment": assignment})
}

// 8. Delete Assignment (Instructor / Admin)
func DeleteAssignment(c *gin.Context) {
	assignmentID := c.Param("id")

	if err := config.DB.Delete(&models.Assignment{}, assignmentID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete assignment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Assignment deleted successfully"})
}