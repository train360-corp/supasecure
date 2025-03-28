package installers

import (
	"github.com/fatih/color"
	"github.com/train360-corp/supasecure/cli/internal/cli/utils/installers/linux"
	"github.com/train360-corp/supasecure/cli/internal/cli/utils/installers/macos"
	"github.com/urfave/cli/v2"
	"runtime"
)

type Installer interface {
	IsDockerInstalled() bool
	InstallDocker() error
	SetupDirectory() error
}

func GetInstaller(origin string) (Installer, error) {

	switch runtime.GOOS {
	case "linux":
		return linux.NewInstaller(origin), nil
	case "darwin":
		return macos.NewInstaller(), nil
	default:
		return nil, cli.Exit(color.RedString("unsupported platform: %s", runtime.GOOS), 1)
	}

}
