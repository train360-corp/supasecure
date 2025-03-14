package models

import "fmt"

type UserTypes string

const (
	Authenticated UserTypes = "authenticated"
	Client        UserTypes = "client"
)

func GetUserType(userType string) (UserTypes, error) {
	switch userType {
	case "authenticated":
		return Authenticated, nil
	case "client":
		return Client, nil
	default:
		return "", fmt.Errorf("unknown user type: %s", userType)
	}
}
