package nginx

import "fmt"

func GetConfig(domain string) string {
	return fmt.Sprintf(`
server {
    listen 80;
    listen [::]:80;
    server_name %s;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name %s;
    ssl_certificate     /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

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
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Authorization $http_authorization;
        proxy_buffer_size 32k;
        proxy_buffers 8 32k;
    }
}
`, domain, domain)
}
