package models

import (
	"time"

	"gorm.io/gorm"
)

type Quiz struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	SectionID uint           `gorm:"not null" json:"section_id"`
	Title     string         `gorm:"size:255;not null" json:"title"`
	Questions []Question     `gorm:"foreignKey:QuizID;constraint:OnDelete:CASCADE" json:"questions,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Question struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	QuizID    uint           `gorm:"not null" json:"quiz_id"`
	Question  string         `gorm:"type:text;not null" json:"question"`
	Options   []Option       `gorm:"foreignKey:QuestionID;constraint:OnDelete:CASCADE" json:"options,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Option struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	QuestionID uint   `gorm:"not null" json:"question_id"`
	OptionText string `gorm:"size:255;not null" json:"option_text"`
	IsCorrect  bool   `gorm:"default:false" json:"is_correct"`
}

type QuizResult struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	QuizID    uint      `gorm:"not null" json:"quiz_id"`
	Score     float64   `gorm:"type:decimal(5,2);not null" json:"score"` // Score in Percentage (e.g., 80.00)
	Passed    bool      `gorm:"default:false" json:"passed"`
	CreatedAt time.Time `json:"created_at"`
}