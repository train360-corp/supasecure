package supasecure

import (
	"github.com/train360-corp/supasecure/internal"
	"github.com/train360-corp/supasecure/internal/cli/commands"
	"github.com/urfave/cli/v2"
)

var CLI = &cli.App{
	Name:    "supasecure",
	Usage:   "A Supabase-backed keystore",
	Version: internal.Version,
	Commands: []*cli.Command{
		commands.AuthCommand,
	},
}
