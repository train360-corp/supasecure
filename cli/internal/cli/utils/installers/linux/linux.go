package linux

import (
	_ "embed"
	"fmt"
	"github.com/fatih/color"
	"github.com/train360-corp/supasecure/cli/internal/cli/utils"
	"github.com/train360-corp/supasecure/cli/internal/utils/supabase"
	"github.com/urfave/cli/v2"
	"os"
	"os/exec"
	"strings"
)

type Installer struct {
	origin string
}

func NewInstaller(origin string) *Installer {
	return &Installer{
		origin: origin,
	}
}

func isPrivilegedUser() bool {
	cmd := exec.Command("id", "-u")
	out, err := cmd.Output()
	if err != nil {
		return false
	}
	return strings.TrimSpace(string(out)) == "0"
}

func (i *Installer) IsDockerInstalled() bool {
	return 0 == utils.CMD("docker -v")
}

func (i *Installer) InstallDocker() error {

	if !isPrivilegedUser() {
		return cli.Exit(color.RedString("command must be run as root user or with sudo"), 1)
	}

	if 0 != utils.CMD("for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do apt-get remove $pkg; done") {
		return cli.Exit(color.RedString("unable to remove outdated docker components"), 1)
	}

	if code, _ := utils.CMDS([]string{
		"apt-get update",
		"apt-get install -y ca-certificates curl",
		"install -m 0755 -d /etc/apt/keyrings",
		"curl -fsSL https://download.docker.com/linux/ubuntu/gpg | tee /etc/apt/keyrings/docker.asc > /dev/null",
		"chmod a+r /etc/apt/keyrings/docker.asc",
		`echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo ${UBUNTU_CODENAME:-$VERSION_CODENAME}) stable" > /etc/apt/sources.list.d/docker.list`,
		"apt-get update",
	}); code != 0 {
		return cli.Exit(color.RedString("unable to install docker keyring"), 1)
	}

	if 0 != utils.CMD("apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin") {
		return cli.Exit(color.RedString("unable to install docker"), 1)
	}

	if !i.IsDockerInstalled() {
		return cli.Exit(color.RedString("unable to verify docker installation"), 1)
	}

	return nil
}

func (i *Installer) SetupDirectory() error {

	path := "/opt/supasecure"

	// create directory
	if !utils.IsDir(path) {
		if err := os.Mkdir(path, 0755); err != nil {
			return cli.Exit(color.RedString("unable to create installation directory"), 1)
		}
	}

	// create .env file
	err := supabase.WriteConfig(fmt.Sprintf("%s/cfg.env", path), supabase.GetConfig(i.origin))
	if err != nil {
		return cli.Exit(color.RedString("unable to write config file to installation directory"), 1)
	}

	return nil
}
