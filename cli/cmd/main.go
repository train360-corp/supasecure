package main

import (
	"github.com/train360-corp/supasecure/cli/internal/cli"
	"os"
)

func main() {
	if err := supasecure.CLI.Run(os.Args); err != nil {
		os.Exit(1)
	}
	os.Exit(0)
}
