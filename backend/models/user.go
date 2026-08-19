package models

import (
	"time"

	"gorm.io/gorm"
)

type Role string

const (
	RoleStudent    Role = "STUDENT"
	RoleInstructor Role = "INSTRUCTOR"
	RoleAdmin      Role = "ADMIN"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"size:255;not null" json:"name"`
	Email     string         `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"size:255;not null" json:"-"` // Passwords JSON response එකට යන්නේ නැත
	Role      Role           `gorm:"type:enum('STUDENT', 'INSTRUCTOR', 'ADMIN');default:'STUDENT'" json:"role"`
	Status    string         `gorm:"size:50;default:'ACTIVE'" json:"status"` // ACTIVE, SUSPENDED
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

