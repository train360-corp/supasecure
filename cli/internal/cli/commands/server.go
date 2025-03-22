package commands

import (
	"github.com/fatih/color"
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
					color.Green("installed docker!")
				} else {
					color.Yellow("docker already installed")
				}

				// setup directory
				if err := installer.SetupDirectory(); err != nil {
					return err
				}

				// link
				if err := installer.LinkBinaryOrService(); err != nil {
					return err
				}

				return nil
			},
		},
	},
}
