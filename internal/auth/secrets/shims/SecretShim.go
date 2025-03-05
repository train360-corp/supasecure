package shims

import "github.com/train360-corp/supasecure/internal/models"

type SecretShim interface {
	GetSecret() (*models.Credentials, error)

	SetSecret(credentials *models.Credentials) error

	RemoveSecret() error
}
