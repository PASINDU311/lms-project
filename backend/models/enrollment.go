package models

import (
	"time"

	"gorm.io/gorm"
)

type Enrollment struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"not null" json:"user_id"`
	User      User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	CourseID  uint           `gorm:"not null" json:"course_id"`
	Course    Course         `gorm:"foreignKey:CourseID" json:"course,omitempty"`
	Status    string         `gorm:"size:50;default:'ACTIVE'" json:"status"` // ACTIVE, CANCELLED, COMPLETED
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}