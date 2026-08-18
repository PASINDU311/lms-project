package controllers

import (
	"net/http"

	"lms-backend/config"
	"lms-backend/models"

	"github.com/gin-gonic/gin"
)

// Instructor & Admin Dashboard Stats
func GetAdminAnalytics(c *gin.Context) {
	var totalStudents int64
	var totalInstructors int64
	var totalCourses int64
	var totalEnrollments int64
	var pendingSubmissions int64

	// 1. Total Students Count
	config.DB.Model(&models.User{}).Where("role = ?", "STUDENT").Count(&totalStudents)

	// 2. Total Instructors Count
	config.DB.Model(&models.User{}).Where("role = ?", "INSTRUCTOR").Count(&totalInstructors)

	// 3. Total Courses Count
	config.DB.Model(&models.Course{}).Count(&totalCourses)

	// 4. Total Enrollments Count
	config.DB.Model(&models.Enrollment{}).Count(&totalEnrollments)

	// 5. Pending Assignments to Grade
	config.DB.Model(&models.AssignmentSubmission{}).Where("status = ?", "SUBMITTED").Count(&pendingSubmissions)

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"total_students":      totalStudents,
			"total_instructors":    totalInstructors,
			"total_courses":        totalCourses,
			"total_enrollments":    totalEnrollments,
			"pending_submissions": pendingSubmissions,
		},
	})
}

// Student Dashboard Overview
func GetStudentAnalytics(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
		return
	}

	var enrolledCount int64
	var completedCount int64

	// Total Enrolled Courses
	config.DB.Model(&models.Enrollment{}).Where("user_id = ?", userID).Count(&enrolledCount)

	// Fetch Enrolled Courses list with details
	var enrollments []models.Enrollment
	config.DB.Preload("Course").Where("user_id = ?", userID).Find(&enrollments)

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"enrolled_courses_count": enrolledCount,
			"completed_courses_count": completedCount,
		},
		"enrollments": enrollments,
	})
}