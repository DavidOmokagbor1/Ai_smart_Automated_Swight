# Production Deployment Guide

## 🚀 AI Smart Light Control System - Production Setup

This guide will help you deploy your AI Smart Light Control System to production.

---

## 📋 Prerequisites

- **Server**: Ubuntu 20.04+ or similar Linux distribution
- **Domain**: A domain name for your application
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)
- **Git**: For code deployment
- **Python 3.8+**: For backend
- **Node.js 16+**: For frontend build

---

## 🏗️ Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Dependencies
```bash
# Install Python and pip
sudo apt install python3 python3-pip python3-venv -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 1.3 Create Application User
```bash
sudo adduser smartlights
sudo usermod -aG sudo smartlights
```

---

## 📦 Step 2: Application Deployment

### 2.1 Clone Repository
```bash
sudo -u smartlights git clone https://github.com/yourusername/ai-smart-light-control.git /home/smartlights/app
cd /home/smartlights/app
```

### 2.2 Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp env.example .env
# Edit .env with your production settings
nano .env

# Initialize database
python3 init_db.py
```

### 2.3 Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build:prod
```

---

## ⚙️ Step 3: Configuration

### 3.1 Environment Variables (.env)
```bash
# Backend .env file
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
PORT=5000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DATABASE_URL=sqlite:///instance/smart_lights.db
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

### 3.2 Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/smartlights
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Frontend (React build)
    location / {
        root /home/smartlights/app/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/smartlights /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Step 4: SSL Certificate

### 4.1 Get SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 4.2 Auto-renewal
```bash
sudo crontab -e
# Add this line for auto-renewal
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🚀 Step 5: Application Service

### 5.1 Create Systemd Service
```bash
sudo nano /etc/systemd/system/smartlights.service
```

Add this configuration:
```ini
[Unit]
Description=AI Smart Light Control System
After=network.target

[Service]
Type=simple
User=smartlights
WorkingDirectory=/home/smartlights/app/backend
Environment=PATH=/home/smartlights/app/backend/venv/bin
ExecStart=/home/smartlights/app/backend/venv/bin/python app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 5.2 Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable smartlights
sudo systemctl start smartlights
sudo systemctl status smartlights
```

---

## 📊 Step 6: Monitoring & Logs

### 6.1 View Logs
```bash
# Application logs
sudo journalctl -u smartlights -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 6.2 Monitor Resources
```bash
# Install monitoring tools
sudo apt install htop iotop -y

# Monitor system resources
htop
```

---

## 🔧 Step 7: Maintenance

### 7.1 Update Application
```bash
cd /home/smartlights/app
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart smartlights

# Update frontend
cd ../frontend
npm install
npm run build:prod
sudo systemctl reload nginx
```

### 7.2 Backup Database
```bash
# Create backup script
sudo nano /home/smartlights/backup.sh
```

Add this content:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/smartlights/backups"
mkdir -p $BACKUP_DIR
cp /home/smartlights/app/backend/instance/smart_lights.db $BACKUP_DIR/smart_lights_$DATE.db
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
```

Make it executable:
```bash
chmod +x /home/smartlights/backup.sh
```

Add to crontab for daily backups:
```bash
crontab -e
# Add this line
0 2 * * * /home/smartlights/backup.sh
```

---

## 🚨 Troubleshooting

### Common Issues:

1. **Port 5000 already in use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **Permission denied**
   ```bash
   sudo chown -R smartlights:smartlights /home/smartlights/app
   ```

3. **Nginx 502 error**
   ```bash
   sudo systemctl status smartlights
   sudo journalctl -u smartlights -n 50
   ```

4. **SSL certificate issues**
   ```bash
   sudo certbot renew --dry-run
   ```

---

## 📈 Performance Optimization

### 7.1 Enable Gzip Compression
Add to Nginx configuration:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 7.2 Cache Static Files
Add to Nginx configuration:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🔐 Security Checklist

- [ ] Changed default secret key
- [ ] Configured firewall (UFW)
- [ ] Set up SSL certificate
- [ ] Enabled automatic security updates
- [ ] Configured proper file permissions
- [ ] Set up monitoring and alerts
- [ ] Regular backups configured
- [ ] Log rotation enabled

---

## 📞 Support

For issues or questions:
1. Check logs: `sudo journalctl -u smartlights -f`
2. Verify configuration: `sudo nginx -t`
3. Test connectivity: `curl -I https://yourdomain.com`

---

**🎉 Congratulations! Your AI Smart Light Control System is now running in production!** 