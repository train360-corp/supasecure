package commands

import (
	"fmt"
	"github.com/fatih/color"
	"github.com/train360-corp/supasecure/cli/internal"
	"github.com/train360-corp/supasecure/cli/internal/cli/utils"
	"github.com/train360-corp/supasecure/cli/internal/cli/utils/installers"
	"github.com/urfave/cli/v2"
	"net/url"
	"strings"
)

func isValidOrigin(s string) bool {
	u, err := url.Parse(s)
	if err != nil {
		return false
	}

	// must have http or https scheme
	if u.Scheme != "http" && u.Scheme != "https" {
		return false
	}

	// must have a host
	if u.Host == "" {
		return false
	}

	// disallow port
	if strings.Contains(u.Host, ":") {
		return false
	}

	// no path, query, or fragment allowed
	if u.Path != "" || u.RawQuery != "" || u.Fragment != "" {
		return false
	}

	return true
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
				&cli.StringFlag{
					Name:     "origin",
					Aliases:  []string{"o"},
					Required: true,
					Action: func(context *cli.Context, s string) error {
						if !isValidOrigin(s) {
							e := "enter a valid origin (e.g., http://example.com or https://example.com)"
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
				origin := c.String("origin")

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
  -p 8000:8000 \
  -p 3030:3030 \
  --volume /opt/supasecure/postgres:/var/lib/postgresql/data \
  --volume /opt/supasecure/logs:/var/log/supervisor \
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
