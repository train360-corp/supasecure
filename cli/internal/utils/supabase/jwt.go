package supabase

import (
	"github.com/golang-jwt/jwt/v5"
	"time"
)

func generateJWT(secret, role string) string {

	const years99 = 99 * 365 * 24 * time.Hour

	now := time.Now()
	claims := jwt.MapClaims{
		"role": role,
		"iss":  "supabase",
		"iat":  now.Unix(),
		"exp":  now.Add(years99).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	str, _ := token.SignedString([]byte(secret))
	return str
}
