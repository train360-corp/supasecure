package macos

type Installer struct {
}

func NewInstaller() *Installer {
	return &Installer{}
}

func (i *Installer) IsDockerInstalled() bool {
	//TODO implement me
	panic("implement me")
}

func (i *Installer) InstallDocker() error {
	//TODO implement me
	panic("implement me")
}

func (i *Installer) SetupDirectory() error {
	//TODO implement me
	panic("implement me")
}
