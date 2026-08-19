package controllers

import (
	"fmt"
	"net/http"

	"lms-backend/config"
	"lms-backend/models"

	"github.com/gin-gonic/gin"
)

// Create Quiz with Questions & Options (Instructor/Admin) + Automatic Notification
func CreateQuiz(c *gin.Context) {
	var input struct {
		SectionID uint   `json:"section_id" binding:"required"`
		Title     string `json:"title" binding:"required"`
		Questions []struct {
			Question string `json:"question" binding:"required"`
			Options  []struct {
				OptionText string `json:"option_text" binding:"required"`
				IsCorrect  bool   `json:"is_correct"`
			} `json:"options" binding:"required"`
		} `json:"questions" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	quiz := models.Quiz{
		SectionID: input.SectionID,
		Title:     input.Title,
	}

	if err := config.DB.Create(&quiz).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create quiz"})
		return
	}

	for _, qInput := range input.Questions {
		question := models.Question{
			QuizID:   quiz.ID,
			Question: qInput.Question,
		}
		config.DB.Create(&question)

		for _, optInput := range qInput.Options {
			option := models.Option{
				QuestionID: question.ID,
				OptionText: optInput.OptionText,
				IsCorrect:  optInput.IsCorrect,
			}
			config.DB.Create(&option)
		}
	}

	// --- 🔔 AUTOMATIC QUIZ NOTIFICATION TRIGGER ---
	go func(sectionID uint, quizTitle string) {
		// 1. Get Course ID from Section
		var section struct {
			CourseID uint
		}
		if err := config.DB.Table("sections").Select("course_id").Where("id = ?", sectionID).Scan(&section).Error; err != nil || section.CourseID == 0 {
			return
		}

		// 2. Get Course Title
		var course struct {
			Title string
		}
		config.DB.Table("courses").Select("title").Where("id = ?", section.CourseID).Scan(&course)

		// 3. Find all Enrolled Students for this Course
		var enrollments []struct {
			UserID uint
		}
		config.DB.Table("enrollments").Select("user_id").Where("course_id = ?", section.CourseID).Find(&enrollments)

		// 4. Send Notification to each Enrolled Student
		notifTitle := "New Quiz Available! 📝"
		notifMsg := fmt.Sprintf("A new quiz '%s' has been published in your course '%s'.", quizTitle, course.Title)
		redirectLink := fmt.Sprintf("/learn/%d", section.CourseID)

		for _, e := range enrollments {
			notification := models.Notification{
				UserID:  e.UserID,
				Title:   notifTitle,
				Message: notifMsg,
				Type:    "QUIZ",
				Link:    redirectLink,
				IsRead:  false,
			}
			config.DB.Create(&notification)
		}
	}(input.SectionID, input.Title)

	c.JSON(http.StatusCreated, gin.H{"message": "Quiz created successfully and notifications sent", "quiz": quiz})
}

// Get All Quizzes by Section ID (Student/Instructor) - FIXED FOR MULTIPLE QUIZZES
func GetQuizBySection(c *gin.Context) {
	sectionID := c.Param("section_id")

	var quizzes []models.Quiz
	if err := config.DB.Preload("Questions.Options").Where("section_id = ?", sectionID).Find(&quizzes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch quizzes"})
		return
	}

	if len(quizzes) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No quizzes found for this section"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"quizzes": quizzes})
}

// Submit Quiz and Auto-Calculate Score (Student)
func SubmitQuiz(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
		return
	}

	var input struct {
		QuizID  uint          `json:"quiz_id" binding:"required"`
		Answers map[uint]uint `json:"answers" binding:"required"` // QuestionID -> SelectedOptionID
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var questions []models.Question
	config.DB.Preload("Options").Where("quiz_id = ?", input.QuizID).Find(&questions)

	if len(questions) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Quiz has no questions"})
		return
	}

	correctCount := 0
	for _, q := range questions {
		selectedOptID, answered := input.Answers[q.ID]
		if answered {
			for _, opt := range q.Options {
				if opt.ID == selectedOptID && opt.IsCorrect {
					correctCount++
					break
				}
			}
		}
	}

	scorePercent := (float64(correctCount) / float64(len(questions))) * 100.0
	passed := scorePercent >= 50.0 // Passing mark 50%

	result := models.QuizResult{
		UserID: userID,
		QuizID: input.QuizID,
		Score:  scorePercent,
		Passed: passed,
	}

	config.DB.Create(&result)

	c.JSON(http.StatusOK, gin.H{
		"message":       "Quiz submitted successfully",
		"score":         scorePercent,
		"correct_count": correctCount,
		"total":         len(questions),
		"passed":        passed,
	})
}