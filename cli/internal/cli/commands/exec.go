package commands

import (
	"fmt"
	"github.com/fatih/color"
	"github.com/google/uuid"
	"github.com/train360-corp/supasecure/cli/internal/models"
	"github.com/train360-corp/supasecure/cli/internal/utils/supabase"
	"github.com/urfave/cli/v2"
	"os"
	"os/exec"
	"strings"
)

var ExecCommand = &cli.Command{
	Name:        "exec",
	Description: "execute a command using secrets",
	Usage:       "execute a command using secrets",
	Flags: []cli.Flag{
		&cli.StringFlag{
			Name:     "env",
			Aliases:  []string{"e"},
			Usage:    "the environment to execute the command against",
			Required: true,
		},
		&cli.StringFlag{
			Name:     "cmd",
			Aliases:  []string{"c"},
			Usage:    "the command to execute (ensure variable and string escaping if used)",
			Required: true,
		},
		&cli.BoolFlag{
			Name:        "verbose",
			Usage:       "show verbose output",
			DefaultText: "false",
			Value:       false,
		},
	},
	Action: func(c *cli.Context) error {

		command := c.String("cmd")
		verbose := c.Bool("verbose")

		uuid, err := uuid.Parse(c.String("env"))
		if err != nil {
			return cli.Exit(color.RedString("'%v' could not be parsed as a uuid: %v", c.String("env"), err.Error()), 1)
		}

		client, err := supabase.GetClient()
		if err != nil {
			return cli.Exit(color.RedString("unable to create supabase client: %v", err.Error()), 1)
		} else if client == nil {
			return cli.Exit(color.RedString("unable to create supabase client (nil client returned)"), 1)
		}

		defer client.Close()
		client.Authenticate()

		var environment *models.Environment
		if err := client.GetById("environments", uuid.String(), &environment); err != nil {
			return cli.Exit(color.RedString(err.Error()), 1)
		} else if environment == nil {
			return cli.Exit(color.RedString("environment not found"), 1)
		}

		var workspace *models.Workspace
		if err := client.GetById("workspaces", environment.WorkspaceID.String(), &workspace); err != nil {
			return cli.Exit(color.RedString(err.Error()), 1)
		} else if environment == nil {
			return cli.Exit(color.RedString("unable to load workspace for environment"), 1)
		}

		var secrets []models.GetSecretsRow
		if err := client.RPC("get_secrets", map[string]string{
			"env_id": environment.ID.String(),
		}, &secrets); err != nil {
			return cli.Exit(color.RedString(err.Error()), 1)
		}

		if verbose {
			color.Blue("Command: '%v'", command)
			color.Blue("Environment: %v", environment.Display)
			color.Blue("Workspace: %v", workspace.Display)
			color.Blue("Secrets: %v", len(secrets))
		}

		// Define the command
		cmd := exec.Command(command)

		// Set custom environment variables
		env := os.Environ()
		for _, secret := range secrets {
			env = append(env, fmt.Sprintf("%v=%v", secret.Variable, strings.TrimSpace(secret.Secret)))
		}
		cmd.Env = env

		// run command
		output, err := cmd.CombinedOutput()
		if err != nil {
			return cli.Exit(color.RedString(string(output)), 1)
		}

		fmt.Println(string(output))
		return nil
	},
}
