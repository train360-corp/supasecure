package utils

import (
	"errors"
	"os"
	"os/exec"
	"syscall"
)

func CMD(cmd string) int {
	err := exec.Command("sh", "-c", cmd).Run()

	if err == nil {
		return 0
	}

	var exitError *exec.ExitError
	if errors.As(err, &exitError) {
		if status, ok := exitError.Sys().(syscall.WaitStatus); ok {
			return status.ExitStatus()
		}
	}

	// unexpected error (non-ExitError or bad type assertion)
	return -1
}

func CMDS(cmds []string) (int, *string) {
	for _, c := range cmds {
		exit := CMD(c)
		if 0 != exit {
			return exit, &c
		}
	}
	return 0, nil
}

func IsFile(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return info.Mode().IsRegular()
}

func IsDir(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return info.IsDir()
}
