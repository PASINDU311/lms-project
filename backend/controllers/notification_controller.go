package controllers

import (
	"net/http"

	"lms-backend/config"
	"lms-backend/models"

	"github.com/gin-gonic/gin"
)

// 1. Get Logged-in User's Notifications
func GetMyNotifications(c *gin.Context) {
	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	// Safe conversion for float64 / uint
	var userID uint
	switch v := val.(type) {
	case float64:
		userID = uint(v)
	case uint:
		userID = v
	case int:
		userID = uint(v)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	var notifications []models.Notification
	if err := config.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"notifications": notifications})
}

// 2. Mark Single Notification as Read
func MarkNotificationAsRead(c *gin.Context) {
	notificationID := c.Param("id")
	val, _ := c.Get("user_id")

	var userID uint
	if f, ok := val.(float64); ok {
		userID = uint(f)
	} else if u, ok := val.(uint); ok {
		userID = u
	}

	if err := config.DB.Model(&models.Notification{}).Where("id = ? AND user_id = ?", notificationID, userID).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

// 3. Mark All Notifications as Read
func MarkAllNotificationsAsRead(c *gin.Context) {
	val, _ := c.Get("user_id")

	var userID uint
	if f, ok := val.(float64); ok {
		userID = uint(f)
	} else if u, ok := val.(uint); ok {
		userID = u
	}

	if err := config.DB.Model(&models.Notification{}).Where("user_id = ?", userID).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notifications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read"})
}

// 4. Create Announcement / Notification (Instructor / Admin Only)
func CreateNotification(c *gin.Context) {
	var input struct {
		Title   string `json:"title" binding:"required"`
		Message string `json:"message" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var users []models.User
	config.DB.Select("id").Find(&users)

	var notifications []models.Notification
	for _, u := range users {
		notifications = append(notifications, models.Notification{
			UserID:  u.ID,
			Title:   input.Title,
			Message: input.Message,
			Type:    "ANNOUNCEMENT",
		})
	}

	if len(notifications) > 0 {
		config.DB.Create(&notifications)
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Announcement sent to all users!"})
}