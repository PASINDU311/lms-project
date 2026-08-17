package models

import (
	"time"

	"gorm.io/gorm"
)

type Payment struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	UserID        uint           `gorm:"not null" json:"user_id"`
	User          User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	CourseID      uint           `gorm:"not null" json:"course_id"`
	Course        Course         `gorm:"foreignKey:CourseID" json:"course,omitempty"`
	Amount        float64        `gorm:"type:decimal(10,2);not null" json:"amount"`
	PaymentMethod string         `gorm:"size:50;default:'CARD'" json:"payment_method"` // CARD, STRIPE, PAYPAL, BANK_TRANSFER
	Status        string         `gorm:"size:50;default:'PENDING'" json:"status"`      // PENDING, SUCCESS, FAILED
	TransactionID string         `gorm:"size:255;uniqueIndex" json:"transaction_id"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}