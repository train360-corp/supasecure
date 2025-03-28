package installers

import (
	"github.com/fatih/color"
	"github.com/train360-corp/supasecure/cli/internal/cli/utils"
	"github.com/train360-corp/supasecure/cli/internal/cli/utils/installers/linux"
	"github.com/urfave/cli/v2"
	"runtime"
)

type Installer interface {
	IsDockerInstalled() bool
	InstallDocker() error
	IsCertbotInstalled() bool
	GetCertbotCertificates() error
	InstallCertbot() error
	SetupDirectory() error
}

func GetInstaller(origin string) (Installer, error) {
	switch runtime.GOOS {
	case "linux":
		if _, code := utils.CMD("snap --version"); 0 != code {
			return nil, cli.Exit(color.RedString("`snap` is required on linux platform, but was not found"), 1)
		}
		return linux.NewInstaller(origin), nil
	default:
		return nil, cli.Exit(color.RedString("unsupported platform: %s", runtime.GOOS), 1)
	}
}
