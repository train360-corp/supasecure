package commands

import (
	emailverifier "github.com/AfterShip/email-verifier"
	"github.com/fatih/color"
	"github.com/train360-corp/supasecure/cli/internal/models"
	"github.com/train360-corp/supasecure/cli/internal/utils/auth/secrets"
	"github.com/train360-corp/supasecure/cli/internal/utils/cmdutil"
	"github.com/train360-corp/supasecure/cli/internal/utils/supabase"
	"github.com/urfave/cli/v2"
	"strings"
)

const DEFAULT_SERVER_URL = "http://127.0.0.1:54321"
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

var AuthCommand = &cli.Command{
	Name:        "auth",
	Description: "manage authentication status",
	Usage:       "manage authentication status",
	Subcommands: []*cli.Command{
		{
			Name:        "show",
			Description: "show existing saved credentials",
			Usage:       "show existing saved credentials",
			Flags: []cli.Flag{
				&cli.BoolFlag{
					Name:        "verify",
					Usage:       "verify the existing login credentials by attempting to authenticate",
					DefaultText: "false",
					Value:       false,
				},
			},
			Action: func(c *cli.Context) error {

				secret, err := secrets.GetSecret()
				if err != nil {
					return cli.Exit(color.RedString(err.Error()), 1)
				}

				verify := c.Bool("verify")
				var verified bool
				if verify {
					client, clientErr := supabase.GetClient()
					defer client.Close()
					if clientErr != nil {
						return cli.Exit(color.RedString("verification failed - an error occurred while creating a client: %s", clientErr.Error()), 1)
					} else {
						v, err := client.Authenticate()
						verified = v
						if err != nil {
							return cli.Exit(color.RedString("verification failed - an error occurred during authentication: %s", err.Error()), 1)
						}
					}
				}

				color.Blue("   email: %s", secret.Email)
				if secret.Password != "" {
					color.Blue("password: %s", strings.Repeat("*", len(secret.Password)))
				} else {
					color.RGB(255, 128, 0).Println("password: (missing)")
				}

				color.Blue("     url: %s", secret.Supabase.Url)
				color.Blue("    anon: %s", secret.Supabase.Keys.Anon)

				if verify {
					print(color.BlueString("verified: "))
					if verified {
						color.Green("✓")
					} else {
						color.Red("failed")
					}
				}

				return nil
			},
		},
		{
			Name:        "logout",
			Description: "remove authentication credentials",
			Usage:       "remove authentication credentials",
			Action: func(c *cli.Context) error {
				err := secrets.RemoveSecret()
				if err != nil {
					return cli.Exit(color.RedString(err.Error()), 1)
				}
				return cli.Exit(color.BlueString("logout successful"), 0)
			},
		},
		{
			Name:        "login",
			Description: "save authentication credentials",
			Usage:       "save authentication credentials",
			Flags: []cli.Flag{
				&cli.StringFlag{
					Name:    "email",
					Aliases: []string{"u"},
					Usage:   "the email address of the client to authenticate with",
				},
				&cli.StringFlag{
					Name:        "url",
					Usage:       "the URL of the Supabase instance to authenticate with",
					DefaultText: DEFAULT_SERVER_URL,
				},
				&cli.StringFlag{
					Name:        "anon",
					Usage:       "the Anon(ymous) Key of the Supabase instance to authenticate with",
					DefaultText: DEFAULT_ANON_KEY,
				},
				&cli.StringFlag{
					Name:        "password",
					Usage:       "the password address of the client to authenticate with",
					DefaultText: DEFAULT_ANON_KEY,
				},
			},
			Action: func(c *cli.Context) error {

				verifier := emailverifier.NewVerifier()
				email, _ := cmdutil.Prompt(c, "email")
				if res, e := verifier.Verify(email); (res == nil || !res.Syntax.Valid) && e != nil {
					return cli.Exit(color.RedString(e.Error()), 1)
				} else if !res.Syntax.Valid {
					return cli.Exit(color.RedString("invalid email address: %s", email), 1)
				}

				pass, _ := cmdutil.Prompt(c, "password")
				url, _ := cmdutil.PromptWithDefault(c, "url", DEFAULT_SERVER_URL)
				anon, _ := cmdutil.PromptWithDefault(c, "anon", DEFAULT_ANON_KEY)

				err := secrets.SetSecret(&models.Credentials{
					Email:    email,
					Password: pass,
					Supabase: models.SupabaseDetails{
						Url: url,
						Keys: models.SupabaseKeys{
							Anon: anon,
						},
					},
				})

				if err != nil {
					return cli.Exit(color.RedString(err.Error()), 1)
				}

				color.Green("login successful")
				return nil
			},
		},
	},
}
