package secrets

import (
	"github.com/train360-corp/supasecure/internal/auth/secrets/shims"
	"github.com/train360-corp/supasecure/internal/models"
)

func SetSecret(credentials *models.Credentials) error {
	return shims.GetShim().SetSecret(credentials)
}

func GetSecret() (*models.Credentials, error) {
	return shims.GetShim().GetSecret()
}

func RemoveSecret() error {
	return shims.GetShim().RemoveSecret()
}
