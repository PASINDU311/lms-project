package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// Global helper function to extract userID safely from gin Context
func getUserID(c *gin.Context) (uint, bool) {
	val, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}

	switch v := val.(type) {
	case uint:
		return v, true
	case float64:
		return uint(v), true
	case int:
		return uint(v), true
	case string:
		id, err := strconv.ParseUint(v, 10, 32)
		if err != nil {
			return 0, false
		}
		return uint(id), true
	default:
		return 0, false
	}
}