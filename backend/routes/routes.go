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

	// Protected Routes (JWT Required)
	protected := r.Group("/api")
	protected.Use(middlewares.AuthMiddleware())
	{
		protected.GET("/profile", controllers.GetProfile)

		// Admin Only Route Example
		protected.GET("/admin/dashboard", middlewares.RoleMiddleware("ADMIN"), func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Welcome to Admin Dashboard!"})
		})
	}

	return r
}