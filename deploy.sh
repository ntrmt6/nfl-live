#!/bin/bash
set -e

APP_DIR="/root/nfl-live"
PM2_NAME="nfl-live"
PORT=3005

cd "$APP_DIR"

echo "==> Installing dependencies..."
npm install

echo "==> Building..."
npm run build

echo "==> Restarting app..."
pm2 restart "$PM2_NAME" 2>/dev/null || pm2 start npm --name "$PM2_NAME" -- start -- --port "$PORT"

pm2 save

echo "==> Checking nginx..."
nginx -t && systemctl reload nginx

echo ""
pm2 show "$PM2_NAME" | grep -E 'status|restart|uptime'
echo ""
echo "Done. Site is live."
