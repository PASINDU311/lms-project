package models

import (
	"time"

	"gorm.io/gorm"
)

type Course struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Title        string         `gorm:"size:255;not null" json:"title"`
	Slug         string         `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	Description  string         `gorm:"type:text" json:"description"`
	Price        float64        `gorm:"type:decimal(10,2);default:0.00" json:"price"`
	InstructorID uint           `gorm:"not null" json:"instructor_id"`
	Instructor   User           `gorm:"foreignKey:InstructorID" json:"instructor,omitempty"`
	Status       string         `gorm:"size:50;default:'DRAFT'" json:"status"` // DRAFT, PUBLISHED, ARCHIVED
	Sections     []Section      `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE" json:"sections,omitempty"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

type Section struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CourseID  uint           `gorm:"not null" json:"course_id"`
	Title     string         `gorm:"size:255;not null" json:"title"`
	Order     int            `gorm:"default:1" json:"order"`
	Lessons   []Lesson       `gorm:"foreignKey:SectionID;constraint:OnDelete:CASCADE" json:"lessons,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Lesson struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	SectionID   uint           `gorm:"not null" json:"section_id"`
	Title       string         `gorm:"size:255;not null" json:"title"`
	ContentType string         `gorm:"size:50;default:'VIDEO'" json:"content_type"` // VIDEO, PDF, TEXT
	VideoURL    string         `gorm:"size:500" json:"video_url"`
	Content     string         `gorm:"type:text" json:"content"`
	IsFree      bool           `gorm:"default:false" json:"is_free"`
	Order       int            `gorm:"default:1" json:"order"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Course Progress tracking structure
type LessonProgress struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;uniqueIndex:idx_user_lesson" json:"user_id"`
	LessonID  uint      `gorm:"not null;uniqueIndex:idx_user_lesson" json:"lesson_id"`
	CourseID  uint      `gorm:"not null" json:"course_id"`
	IsDone    bool      `gorm:"default:true" json:"is_done"`
	CreatedAt time.Time `json:"created_at"`
}