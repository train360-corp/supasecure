# supasecure

## Server

### Getting Started

Via Docker:

```shell
docker run 
```

### System Service

> Note that the desired version of supasecure and the two paths (one for .env config values, and the other for the
directory to store postgres data in) should be updated.

`supasecure.service`

```ini
[Unit]
Description=Supasecure
After=network.target docker.service
Requires=docker.service

[Service]
Restart=unless-stopped
ExecStart=/usr/bin/docker run --name supasecure --env-file /path/to/cfg.env -p 8000:8000 -p 3030:3030 --volume /path/to/store/postgres/data:/var/lib/postgresql/data ghcr.io/train360-corp/supasecure:v1.12.3
ExecStop=/usr/bin/docker stop supasecure
ExecStopPost=/usr/bin/docker rm -f supasecure
User=train360
Group=docker

[Install]
WantedBy=multi-user.target
```

## CLI

### Getting Started

Install via Homebrew:

```shell
brew tap train360-corp/taps/supasecure
brew install train360-corp/taps/supasecure
```

### Updating

Via Homebrew: `brew upgrade supasecure`