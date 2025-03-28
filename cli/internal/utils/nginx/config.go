package nginx

import "fmt"

func GetConfig(domain string) string {
	return fmt.Sprintf(`
server {
    listen 80;
    listen [::]:80;
    server_name %s;
    large_client_header_buffers 4 32k;
    client_max_body_size 20M;
    location / {
        proxy_pass http://127.0.0.1:3030/;
        proxy_buffering off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_buffer_size 32k;
        proxy_buffers 8 32k;
    }

    location /supabase/ {
        rewrite ^/supabase/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:8000/;
        proxy_buffering off;
        proxy_redirect off;
        proxy_read_timeout 86400;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Authorization $http_authorization;
        proxy_buffer_size 32k;
        proxy_buffers 8 32k;
    }
}`, domain)
}
