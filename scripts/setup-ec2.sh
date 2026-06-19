#!/bin/bash
# One-time EC2 setup for Guitar Vault — Amazon Linux 2023
set -e

# --- Node.js via nvm ---
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 22
nvm alias default 22

# --- PM2 ---
npm install -g pm2

# --- nginx + certbot ---
sudo dnf install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx

# --- Clone repo ---
git clone https://github.com/CyanideMolar/guitar-vault.git ~/guitar-vault
cd ~/guitar-vault

# --- Create uploads directory ---
mkdir -p public/uploads

# --- Environment ---
echo ""
echo "==========================================="
echo "  Copy your .env.local to ~/guitar-vault/.env.local before continuing."
echo "  Required vars: AUTH_SECRET, AUTH_URL, GOOGLE_CLIENT_ID,"
echo "  GOOGLE_CLIENT_SECRET, DATABASE_URL, ADMIN_EMAIL, ALLOWED_EMAILS"
echo "==========================================="
read -p "Press Enter once .env.local is in place..."

# --- Install, build, start ---
npm ci
npx prisma generate
npx prisma db push
npm run build
pm2 start npm --name guitar-vault -- start
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user | tail -1 | sudo bash

# --- nginx config ---
sudo cp scripts/nginx.conf /etc/nginx/conf.d/guitarvault.conf
sudo nginx -t
sudo systemctl start nginx

# --- SSL ---
sudo certbot --nginx -d guitarvault.io -d www.guitarvault.io

echo ""
echo "Done. Guitar Vault is live at https://guitarvault.io"
