package commands

import (
	"fmt"
	"github.com/fatih/color"
	"github.com/train360-corp/supasecure/cli/internal"
	"github.com/train360-corp/supasecure/cli/internal/cli/utils"
	"github.com/train360-corp/supasecure/cli/internal/cli/utils/installers"
	"github.com/urfave/cli/v2"
	"regexp"
)

func isValidOrigin(s string) bool {
	return regexp.MustCompile(`^([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(\d{1,3}\.){3}\d{1,3})$`).MatchString(s)
}

var ServerCommand = &cli.Command{
	Name:        "server",
	Description: "manage a standalone supasecure instance",
	Usage:       "manage a standalone supasecure instance",
	Subcommands: []*cli.Command{
		{
			Name:        "install",
			Usage:       "install an instance locally",
			Description: "install an instance locally",
			Flags: []cli.Flag{
				&cli.BoolFlag{
					Name:     "internal",
					Aliases:  []string{"i"},
					Required: false,
					Usage:    "whether the domain is a valid FQDN (publicly accessible) or a private, internal-only domain (determines SSL method as either Certbot or self-signed)",
				},
				&cli.StringFlag{
					Name:     "domain",
					Aliases:  []string{"d"},
					Required: true,
					Usage:    "sets the domain to use",
					Action: func(context *cli.Context, s string) error {
						if !isValidOrigin(s) {
							e := "enter a valid domain (e.g., example.com or example.local)"
							color.Red(e)
							return cli.Exit(e, 1)
						} else {
							return nil
						}
					},
				},
			},
			Action: func(c *cli.Context) error {

				color.Blue("installing server...")

				// validate in flag handler
				origin := c.String("domain")

				var err error
				var installer installers.Installer

				// get installer
				if installer, err = installers.GetInstaller(origin); err != nil {
					return err
				}

				// install docker
				if !installer.IsDockerInstalled() {
					color.Blue("installing docker...")
					if err := installer.InstallDocker(); err != nil {
						return err
					}
					color.Blue("installed docker!")
				} else {
					color.Yellow("docker already installed")
				}

				// setup directory
				color.Blue("creating supasecure files...")
				if err := installer.SetupDirectory(); err != nil {
					return err
				}
				if _, code := utils.CMD(fmt.Sprintf("ghcr.io/train360-corp/supasecure:v%v", internal.Version)); code != 0 {
					color.Yellow("unable to pre-pull supasecure docker image")
				}
				color.Blue("created supasecure files!")

				// install SSL certificates
				if c.Bool("internal") {
					color.Blue("generating self-signed SSL certificates...")
					if !installer.IsOpenSSLInstalled() {
						return cli.Exit("openssl not installed, but is required for generating self-signed SSL certificates!", 1)
					}
					if err := installer.GetOpenSSLCertificates(); err != nil {
						return err
					}
					color.Blue("generated self-signed SSL certificates!")
				} else {
					if !installer.IsCertbotInstalled() {
						color.Blue("installing certbot...")
						if err := installer.InstallCertbot(); err != nil {
							return err
						}
						color.Blue("installed certbot!")
					} else {
						color.Yellow("certbot already installed")
					}

					// configure certbot
					color.Blue("retrieving certbot certificates...")
					if err := installer.GetCertbotCertificates(); err != nil {
						return err
					}
					color.Blue("retrieved certbot certificates!")
				}

				color.Green("server installed!")

				return nil
			},
		},
		{
			Name:        "start",
			Usage:       "start the server",
			Description: "start the server",
			Action: func(c *cli.Context) error {

				// attempt to stop if already running
				utils.CMD("/usr/bin/docker rm supasecure")

				// start
				color.Blue("starting server...")
				output, exitCode := utils.CMD(fmt.Sprintf(`/usr/bin/docker run -d \
  --name supasecure \
  --restart unless-stopped \
  --log-driver=journald \
  --env-file /opt/supasecure/cfg.env \
  --publish 80:80 \
  --publish 443:443 \
  --volume /opt/supasecure/postgres:/var/lib/postgresql/data \
  --volume /opt/supasecure/logs:/var/log/supervisor \
  --volume /opt/supasecure/nginx:/etc/nginx/sites-enabled \
  ghcr.io/train360-corp/supasecure:v%v`, internal.Version))

				if exitCode != 0 {
					color.Red(output)
					return cli.Exit(color.RedString("unable to start server"), 1)
				} else {
					color.Green("server started")
					return nil
				}

			},
		},
		{
			Name:        "stop",
			Usage:       "stop the server",
			Description: "stop the server",
			Action: func(c *cli.Context) error {
				color.Blue("stopping server...")
				if output, exitCode := utils.CMD("/usr/bin/docker stop supasecure"); exitCode != 0 {
					color.Red(output)
					return cli.Exit(color.RedString("unable to stop server"), 1)
				} else {
					color.Green("server stopped")
					return nil
				}

			},
		},
	},
}
