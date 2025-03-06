package secrets

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/train360-corp/supasecure/cli/internal/models"
	"github.com/zalando/go-keyring"
)

const (
	Service = "web"
	Account = "web@local"
)

func SetSecret(credentials *models.Credentials) error {
	serialized, err := json.Marshal(credentials)
	if err != nil {
		return errors.New(fmt.Sprintf("error serializing secret: %v", err))
	}

	if err := keyring.Set(Service, Account, string(serialized)); err != nil {
		return err
	}

	return nil
}

func GetSecret() (*models.Credentials, error) {
	secret, err := keyring.Get(Service, Account)
	if err != nil {
		return nil, err
	}

	var client models.Credentials
	if err := json.Unmarshal([]byte(secret), &client); err != nil {
		return nil, err
	}
	return &client, nil

}

func RemoveSecret() error {
	return keyring.Delete(Service, Account)
}
