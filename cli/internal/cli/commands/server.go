package commands

import (
	"fmt"
	"github.com/fatih/color"
	"github.com/train360-corp/supasecure/cli/internal"
	"github.com/train360-corp/supasecure/cli/internal/cli/utils"
	"github.com/train360-corp/supasecure/cli/internal/cli/utils/installers"
	"github.com/urfave/cli/v2"
	"os"
	"path/filepath"
	"regexp"
)

func isValidOrigin(s string) bool {
	return regexp.MustCompile(`^([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(\d{1,3}\.){3}\d{1,3})$`).MatchString(s)
}

func getLetsEncryptCerts() *string {
	basePath := "/etc/letsencrypt/live"

	entries, err := os.ReadDir(basePath)
	if err != nil {
		return nil
	}

	var dirs []string
	for _, entry := range entries {
		if entry.IsDir() {
			dirs = append(dirs, entry.Name())
		}
	}

	if len(dirs) == 0 {
		return nil
	}
	if len(dirs) > 1 {
		return nil
	}

	fullPath := filepath.Join(basePath, dirs[0])
	return &fullPath
}

// resolveCertPaths returns absolute paths of privkey.pem and cert.pem
// If they are symlinks, resolves them. If they are regular files, returns absolute path.
func resolveCertPaths(certDir string) (privKeyPath, certPath string, err error) {
	privKeyInput := filepath.Join(certDir, "privkey.pem")
	certInput := filepath.Join(certDir, "cert.pem")

	privKeyResolved, err := resolveIfSymlink(privKeyInput)
	if err != nil {
		return "", "", fmt.Errorf("privkey.pem: %w", err)
	}

	certResolved, err := resolveIfSymlink(certInput)
	if err != nil {
		return "", "", fmt.Errorf("cert.pem: %w", err)
	}

	return privKeyResolved, certResolved, nil
}

func resolveIfSymlink(path string) (string, error) {
	info, err := os.Lstat(path)
	if err != nil {
		return "", fmt.Errorf("file does not exist: %w", err)
	}

	if info.Mode()&os.ModeSymlink != 0 {
		resolved, err := filepath.EvalSymlinks(path)
		if err != nil {
			return "", fmt.Errorf("failed to resolve symlink: %w", err)
		}
		return resolved, nil
	}

	// If not symlink, return absolute path
	abs, err := filepath.Abs(path)
	if err != nil {
		return "", fmt.Errorf("failed to get absolute path: %w", err)
	}
	return abs, nil
}

func getRunCommand(privKey string, cert string) string {
	return fmt.Sprintf(`/usr/bin/docker run -d \
  --name supasecure \
  --restart unless-stopped \
  --log-driver=journald \
  --env-file /opt/supasecure/cfg.env \
  --publish 443:443 \
  --publish 80:80 \
  --volume /opt/supasecure/postgres:/var/lib/postgresql/data \
  --volume /opt/supasecure/logs:/var/log/supervisor \
  --volume /opt/supasecure/nginx:/etc/nginx/sites-enabled:ro \
  --volume %s:/supasecure/ssl-certificates/privkey.pem:ro \
  --volume %s:/supasecure/ssl-certificates/cert.pem:ro \
  ghcr.io/train360-corp/supasecure:v%v`, privKey, cert, internal.Version)
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
				color.Blue("configuring SSL...")
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

				// ssl certificates directory
				certs := "/opt/supasecure/self-signed-certs"
				if letsEncryptDir := getLetsEncryptCerts(); letsEncryptDir != nil {
					certs = *letsEncryptDir
				}

				if !utils.IsDir(certs) {
					return cli.Exit(color.RedString("unable to locate SSL certificates!"), 1)
				}

				privKey, cert, err := resolveCertPaths(certs)
				if err != nil {
					return err
				}

				// start
				color.Blue("starting server...")
				if output, exitCode := utils.CMD(getRunCommand(privKey, cert)); exitCode != 0 {
					color.Red(output)
					return cli.Exit(color.RedString("unable to start server"), 1)
				}
				color.Green("server started")
				return nil
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
