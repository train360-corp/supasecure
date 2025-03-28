package supabase

import (
	"fmt"
	random "github.com/train360-corp/supasecure/cli/internal/utils"
	"os"
	"strings"
)

type Config map[string]string

func GetConfig(siteURL string) Config {
	secret := random.String(40)
	return map[string]string{
		// Access + Public URLs
		"SITE_URL":            fmt.Sprintf("https://%s", siteURL),
		"SUPABASE_PUBLIC_URL": fmt.Sprintf("https://%v/supabase", siteURL),

		// Supabase keys
		"SUPABASE_JWT_SECRET":  secret,
		"SUPABASE_ANON_KEY":    generateJWT(secret, "anon"),
		"SUPABASE_SERVICE_KEY": generateJWT(secret, "service_role"),
		"VAULT_ENC_KEY":        random.String(64),

		// Realtime
		"SUPABASE_REALTIME_SECRET_KEY_BASE": random.String(64),

		// Postgres
		"SUPABASE_POSTGRES_PASSWORD": random.String(64),

		// Dashboard access
		"DASHBOARD_USERNAME": random.String(64),
		"DASHBOARD_PASSWORD": random.String(64),

		// Auth settings
		"GOTRUE_JWT_EXP":                          "604800",
		"GOTRUE_URI_ALLOW_LIST":                   fmt.Sprintf("%v/*", siteURL),
		"GOTRUE_DISABLE_SIGNUP":                   "false",
		"GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED": "false",

		// Email provider
		"GOTRUE_EXTERNAL_EMAIL_ENABLED": "true",
		"GOTRUE_MAILER_AUTOCONFIRM":     "false",
		"GOTRUE_SMTP_ADMIN_EMAIL":       "something@email.com",
		"GOTRUE_SMTP_HOST":              "host.docker.internal",
		"GOTRUE_SMTP_PORT":              "2500",
		"GOTRUE_SMTP_USER":              "apikey",
		"GOTRUE_SMTP_PASS":              "api-key-here",
		"GOTRUE_SMTP_SENDER_NAME":       "fake_sender",
	}
}

func WriteConfig(filename string, config Config) error {
	var builder strings.Builder
	for key, value := range config {
		escaped := strings.ReplaceAll(value, "\n", "\\n") // escape newlines if present
		builder.WriteString(fmt.Sprintf("%s=%s\n", key, escaped))
	}

	return os.WriteFile(filename, []byte(builder.String()), 0644)
}
