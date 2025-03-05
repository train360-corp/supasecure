//go:build darwin

package shims

import (
	"encoding/json"
	"errors"
	"github.com/keybase/go-keychain"
	errors2 "github.com/train360-corp/supasecure/cli/internal/auth/secrets/errors"
	"github.com/train360-corp/supasecure/cli/internal/models"
	"log"
)

type MacSecretsShim struct {
}

func (m *MacSecretsShim) SetSecret(client *models.Credentials) error {

	// remove existing secret, if there is one
	m.RemoveSecret()

	serialized, err := json.Marshal(client)
	if err != nil {
		log.Fatalf("error serializing secret: %v", err)
	}

	item := keychain.NewItem()
	item.SetSecClass(keychain.SecClassGenericPassword)
	item.SetService(Service)
	item.SetAccount(Account)
	item.SetAccessGroup(AccessGroup)
	item.SetData(serialized)
	item.SetSynchronizable(keychain.SynchronizableNo)
	item.SetAccessible(keychain.AccessibleWhenUnlocked)

	e := keychain.AddItem(item)
	if errors.Is(e, keychain.ErrorDuplicateItem) {
		return &errors2.DuplicateError{
			Err:  "credential exists",
			Hint: "use the logout command to remove any existing credential and try again",
		}
	}
	return e
}

func (m *MacSecretsShim) GetSecret() (*models.Credentials, error) {
	query := keychain.NewItem()
	query.SetSecClass(keychain.SecClassGenericPassword)
	query.SetService(Service)
	query.SetAccount(Account)
	query.SetAccessGroup(AccessGroup)
	query.SetMatchLimit(keychain.MatchLimitOne)
	query.SetReturnData(true)
	results, err := keychain.QueryItem(query)
	if err != nil {
		return nil, err
	} else if len(results) != 1 {
		return nil, errors2.NewNotFoundError()
	} else {
		var client models.Credentials
		err := json.Unmarshal(results[0].Data, &client)
		if err != nil {
			return nil, err
		}
		return &client, nil
	}
}

func (m *MacSecretsShim) RemoveSecret() error {
	deleteItem := keychain.NewItem()
	deleteItem.SetSecClass(keychain.SecClassGenericPassword)
	deleteItem.SetService(Service)
	deleteItem.SetAccount(Account)
	deleteItem.SetAccessGroup(AccessGroup)
	if err := keychain.DeleteItem(deleteItem); err != nil {
		if !errors.Is(err, keychain.ErrorItemNotFound) {
			return err
		}
	}
	return nil
}
