package linux

import (
	"fmt"
	"github.com/fatih/color"
	"github.com/train360-corp/supasecure/cli/internal/cli/utils"
	"github.com/train360-corp/supasecure/cli/internal/utils/nginx"
	"github.com/train360-corp/supasecure/cli/internal/utils/supabase"
	"github.com/urfave/cli/v2"
	"os"
	"os/exec"
	"strings"
)

type Installer struct {
	host string
}

func NewInstaller(host string) *Installer {
	return &Installer{
		host: host,
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

func (i *Installer) IsCertbotInstalled() bool {
	_, code := utils.CMD("certbot --version")
	return 0 == code
}

func (i *Installer) InstallCertbot() error {

	if !isPrivilegedUser() {
		return cli.Exit(color.RedString("command must be run as root user or with sudo"), 1)
	}

	// remove any existing certbot
	utils.CMD("sudo apt remove certbot")

	// install snap core
	if _, code := utils.CMD("sudo snap install core; sudo snap refresh core"); 0 != code {
		return cli.Exit(color.RedString("unable to install snap core"), 1)
	}

	// install certbot
	if _, code := utils.CMD("sudo snap install --classic certbot"); code != 0 {
		return cli.Exit(color.RedString("unable to install certbot"), 1)
	}

	// link certbot
	utils.CMD("sudo ln -s /snap/bin/certbot /usr/bin/certbot")

	return nil
}

func (i *Installer) IsDockerInstalled() bool {
	_, code := utils.CMD("docker -v")
	return 0 == code
}

func (i *Installer) InstallDocker() error {

	if !isPrivilegedUser() {
		return cli.Exit(color.RedString("command must be run as root user or with sudo"), 1)
	}

	if _, code := utils.CMD("for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do apt-get remove $pkg; done"); 0 != code {
		return cli.Exit(color.RedString("unable to remove outdated docker components"), 1)
	}

	if _, code, _ := utils.CMDS([]string{
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

	if _, code := utils.CMD("apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"); 0 != code {
		return cli.Exit(color.RedString("unable to install docker"), 1)
	}

	if !i.IsDockerInstalled() {
		return cli.Exit(color.RedString("unable to verify docker installation"), 1)
	}

	return nil
}

func (i *Installer) GetCertbotCertificates() error {
	if resp, code := utils.CMD(fmt.Sprintf(`sudo certbot certonly --standalone --non-interactive --agree-tos --expand -d %s -d supabase.%s`, i.host, i.host)); code != 0 {
		return cli.Exit(color.RedString("unable to get certbot certificates: %v", resp), 1)
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
	if err := supabase.WriteConfig(fmt.Sprintf("%s/cfg.env", path), supabase.GetConfig(i.host)); err != nil {
		return cli.Exit(color.RedString("unable to write config file to installation directory"), 1)
	}

	// create nginx config
	nginxPath := fmt.Sprintf("%s/nginx", path)
	if !utils.IsDir(nginxPath) {
		if err := os.Mkdir(nginxPath, 0755); err != nil {
			return cli.Exit(color.RedString("unable to create nginx installation directory"), 1)
		}
	}
	if err := utils.Write(fmt.Sprintf("%s/supasecure.conf", nginxPath), nginx.GetConfig(i.host)); err != nil {
		return cli.Exit(color.RedString("unable to write nginx configuration file to installation directory"), 1)
	}

	return nil
}
