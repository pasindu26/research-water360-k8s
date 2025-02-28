#!/bin/sh
echo "Injecting environment variables..."

# Replace placeholders with actual environment variable values
envsubst < /usr/share/nginx/html/env-config.js.template > /usr/share/nginx/html/env-config.js

# Start Nginx
exec "$@"
