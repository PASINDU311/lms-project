package models

import (
	"time"

	"gorm.io/gorm"
)

type Assignment struct {
	ID          uint                 `gorm:"primaryKey" json:"id"`
	SectionID   uint                 `gorm:"not null" json:"section_id"`
	Title       string               `gorm:"size:255;not null" json:"title"`
	Description string               `gorm:"type:text;not null" json:"description"`
	MaxMarks    float64              `gorm:"type:decimal(5,2);default:100.00" json:"max_marks"`
	DueDate     *time.Time           `json:"due_date,omitempty"`
	Submissions []AssignmentSubmission `gorm:"foreignKey:AssignmentID;constraint:OnDelete:CASCADE" json:"submissions,omitempty"`
	CreatedAt   time.Time            `json:"created_at"`
	UpdatedAt   time.Time            `json:"updated_at"`
	DeletedAt   gorm.DeletedAt       `gorm:"index" json:"-"`
}

type AssignmentSubmission struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	AssignmentID uint       `gorm:"not null;uniqueIndex:idx_user_assignment" json:"assignment_id"`
	UserID       uint       `gorm:"not null;uniqueIndex:idx_user_assignment" json:"user_id"`
	User         User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
	SubmissionURL string     `gorm:"size:500" json:"submission_url"` // File/Drive Link
	Content      string     `gorm:"type:text" json:"content"`       // Text Answer
	Marks        *float64   `gorm:"type:decimal(5,2)" json:"marks,omitempty"`
	Feedback     string     `gorm:"type:text" json:"feedback,omitempty"`
	Status       string     `gorm:"size:50;default:'SUBMITTED'" json:"status"` // SUBMITTED, GRADED
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}