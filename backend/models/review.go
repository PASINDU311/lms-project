package models

import (
	"time"

	"gorm.io/gorm"
)

type Review struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CourseID  uint           `gorm:"not null;uniqueIndex:idx_user_course_review" json:"course_id"`
	UserID    uint           `gorm:"not null;uniqueIndex:idx_user_course_review" json:"user_id"`
	User      User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Rating    int            `gorm:"not null" json:"rating"` // 1 to 5
	Comment   string         `gorm:"type:text" json:"comment"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
