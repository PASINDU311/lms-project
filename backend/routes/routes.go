package routes

import (
	"lms-backend/controllers"
	"lms-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Global CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Public Auth Routes
	authGroup := r.Group("/api/auth")
	{
		authGroup.POST("/register", controllers.Register)
		authGroup.POST("/login", controllers.Login)
	}

	// Public Course Routes
	r.GET("/api/courses", controllers.GetCourses)
	r.GET("/api/courses/:id", controllers.GetCourseByID)
	r.GET("/api/courses/:id/reviews", controllers.GetCourseReviews)

	// Protected Routes (JWT Required)
	protected := r.Group("/api")
	protected.Use(middlewares.AuthMiddleware())
	{
		protected.GET("/profile", controllers.GetProfile)

		// Student Progress Routes
		protected.POST("/progress/complete", controllers.CompleteLesson)
		protected.GET("/progress/:course_id", controllers.GetCourseProgress)

		// Student / User Enrollment Routes
		protected.POST("/enrollments", controllers.EnrollCourse)
		protected.GET("/my-courses", controllers.GetMyEnrollments)

		// Quiz Routes (Student)
		protected.GET("/quizzes/section/:section_id", controllers.GetQuizBySection)
		protected.POST("/quizzes/submit", controllers.SubmitQuiz)

		// Assignment Routes (Student)
		protected.GET("/assignments/section/:section_id", controllers.GetAssignmentsBySection)
		protected.POST("/assignments/submit", controllers.SubmitAssignment)
		protected.GET("/assignments/:assignment_id/my-submission", controllers.GetMySubmission) // 👈 🔥 මෙන්න මේ පේලිය එකතු වුණා!

		// Review Routes
		protected.POST("/reviews", controllers.AddOrUpdateReview)

		// Instructor / Admin Only Routes
		instructorAdmin := protected.Group("")
		instructorAdmin.Use(middlewares.RoleMiddleware("INSTRUCTOR", "ADMIN"))
		{
			// Course Management
			instructorAdmin.POST("/courses", controllers.CreateCourse)
			instructorAdmin.PUT("/courses/:id", controllers.UpdateCourse)
			instructorAdmin.DELETE("/courses/:id", controllers.DeleteCourse)

			// Section Management
			instructorAdmin.POST("/sections", controllers.CreateSection)
			instructorAdmin.PUT("/sections/:id", controllers.UpdateSection)
			instructorAdmin.DELETE("/sections/:id", controllers.DeleteSection)

			// Lesson Management
			instructorAdmin.POST("/lessons", controllers.CreateLesson)
			instructorAdmin.PUT("/lessons/:id", controllers.UpdateLesson)
			instructorAdmin.DELETE("/lessons/:id", controllers.DeleteLesson)

			// Quiz Management (Instructor / Admin)
			instructorAdmin.POST("/quizzes", controllers.CreateQuiz)

			// Assignment Management (Instructor)
			instructorAdmin.POST("/assignments", controllers.CreateAssignment)
			instructorAdmin.GET("/assignments/:assignment_id/submissions", controllers.GetAssignmentSubmissions)
			instructorAdmin.PUT("/assignments/submissions/:submission_id/grade", controllers.GradeAssignment)
		}
	}

	return r
}