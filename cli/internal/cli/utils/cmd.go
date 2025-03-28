package utils

import (
	"errors"
	"os"
	"os/exec"
	"syscall"
)

func CMD(cmd string) (string, int) {

	output, err := exec.Command("sh", "-c", cmd).CombinedOutput()

	if err == nil {
		return string(output), 0
	}

	var exitError *exec.ExitError
	if errors.As(err, &exitError) {
		if status, ok := exitError.Sys().(syscall.WaitStatus); ok {
			return string(output), status.ExitStatus()
		}
	}

	// unexpected error (non-ExitError or bad type assertion)
	return string(output), -1
}

func CMDS(cmds []string) (string, int, *string) {
	for _, c := range cmds {
		output, code := CMD(c)
		if 0 != code {
			return output, code, &c
		}
	}
	return "", 0, nil
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

func Write(filename string, contents string) error {
	return os.WriteFile(filename, []byte(contents), 0644)
}
