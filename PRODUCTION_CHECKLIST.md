# Production Deployment Checklist

## Pre-Deployment Checklist

### ✅ Security

- [ ] **Change SESSION_SECRET** to a strong, random 32+ character string
- [ ] **Set NODE_ENV** to `production`
- [ ] **Enable HTTPS** for all connections
- [ ] **Update CORS settings** to allow only trusted domains
- [ ] **Set secure cookie flag** to `true` in session config
- [ ] **Remove or secure** all default admin accounts
- [ ] **Change all default passwords** to strong, unique passwords
- [ ] **Enable rate limiting** on API endpoints
- [ ] **Implement CSRF protection** for forms
- [ ] **Set up firewall rules** to restrict database access
- [ ] **Enable MongoDB authentication**
- [ ] **Use environment variables** for all sensitive data
- [ ] **Remove .env file** from version control (add to .gitignore)
- [ ] **Disable debug/verbose logging** in production

### ✅ Database

- [ ] **Set up production MongoDB** instance (MongoDB Atlas, AWS, etc.)
- [ ] **Update MONGODB_URI** to production database
- [ ] **Enable MongoDB authentication** with strong credentials
- [ ] **Set up database backups** (automated daily backups)
- [ ] **Create database indexes** for performance
- [ ] **Test database connection** from production server
- [ ] **Set up monitoring** for database performance
- [ ] **Configure connection pooling** appropriately
- [ ] **Set up replica set** for high availability (optional)
- [ ] **Implement database migration strategy**

### ✅ Application

- [ ] **Run `npm install --production`** to install only production dependencies
- [ ] **Remove development dependencies** from package.json
- [ ] **Minify and bundle** client-side JavaScript
- [ ] **Optimize images** and static assets
- [ ] **Enable gzip compression** for responses
- [ ] **Set up CDN** for static assets (optional)
- [ ] **Configure proper error handling** without exposing stack traces
- [ ] **Set up health check endpoint** for monitoring
- [ ] **Implement graceful shutdown** handling
- [ ] **Configure process manager** (PM2, systemd, etc.)

### ✅ Monitoring & Logging

- [ ] **Set up application monitoring** (New Relic, DataDog, etc.)
- [ ] **Configure error tracking** (Sentry, Rollbar, etc.)
- [ ] **Set up log aggregation** (ELK stack, CloudWatch, etc.)
- [ ] **Create alerts** for critical errors
- [ ] **Monitor API response times**
- [ ] **Track user activity** and audit logs
- [ ] **Set up uptime monitoring** (Pingdom, UptimeRobot, etc.)
- [ ] **Configure performance monitoring**

### ✅ Email Configuration

- [ ] **Set up SMTP server** for email notifications
- [ ] **Configure email templates** for password reset, verification, etc.
- [ ] **Test email delivery** in production environment
- [ ] **Set up email rate limiting** to prevent spam
- [ ] **Configure SPF and DKIM** records for email authentication

### ✅ Backup & Recovery

- [ ] **Set up automated database backups**
- [ ] **Test backup restoration** process
- [ ] **Document recovery procedures**
- [ ] **Set up off-site backup storage**
- [ ] **Create disaster recovery plan**
- [ ] **Schedule regular backup testing**

### ✅ Performance

- [ ] **Enable caching** where appropriate (Redis, Memcached)
- [ ] **Optimize database queries** with proper indexes
- [ ] **Implement pagination** for large datasets
- [ ] **Set up load balancing** (if needed)
- [ ] **Configure CDN** for static assets
- [ ] **Enable HTTP/2** if supported
- [ ] **Optimize session storage** (consider Redis)
- [ ] **Set appropriate cache headers**

### ✅ Documentation

- [ ] **Update README** with production setup instructions
- [ ] **Document API endpoints** (Swagger/OpenAPI)
- [ ] **Create runbook** for common operations
- [ ] **Document deployment process**
- [ ] **Create troubleshooting guide**
- [ ] **Document environment variables**

## Environment Variables for Production

```env
# Server Configuration
PORT=8080
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crm_system?retryWrites=true&w=majority

# Session Configuration
SESSION_SECRET=CHANGE_THIS_TO_A_STRONG_RANDOM_32_PLUS_CHARACTER_STRING

# Application Configuration
APP_NAME=CRM System
APP_URL=https://yourdomain.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-newrelic-key
```

## Deployment Steps

### 1. Prepare Server

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 LTS recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB (if self-hosting)
# Follow MongoDB installation guide for your OS

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (for reverse proxy)
sudo apt install -y nginx
```

### 2. Clone and Setup Application

```bash
# Clone repository
git clone <your-repo-url>
cd Live

# Install dependencies (production only)
npm ci --production

# Copy and configure environment variables
cp .env.example .env
nano .env  # Edit with production values
```

### 3. Database Setup

```bash
# Seed production database (one-time only)
npm run seed

# Or import from backup
mongorestore --uri="mongodb+srv://..." --archive=backup.archive
```

### 4. Configure PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'crm-system',
    script: './app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

Start with PM2:

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

### 5. Configure Nginx

Create `/etc/nginx/sites-available/crm-system`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:8080;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/crm-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 7. Set Up Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

## Post-Deployment Verification

### ✅ Functional Testing

- [ ] **Test user login** with all role types
- [ ] **Create a new user** through the UI
- [ ] **Create a new role** through the UI
- [ ] **Assign permissions** to a role
- [ ] **Update user information**
- [ ] **Delete a user** (non-system)
- [ ] **Test password change** functionality
- [ ] **Verify email validation** works
- [ ] **Test role hierarchy** enforcement
- [ ] **Verify permission checks** work correctly

### ✅ Security Testing

- [ ] **Test with invalid credentials**
- [ ] **Verify session expiration** works
- [ ] **Test HTTPS redirect** works
- [ ] **Check security headers** are present
- [ ] **Verify CORS settings** are correct
- [ ] **Test rate limiting** (if implemented)
- [ ] **Check for exposed sensitive data** in responses
- [ ] **Verify error messages** don't expose system details

### ✅ Performance Testing

- [ ] **Load test** with expected user load
- [ ] **Check API response times**
- [ ] **Verify database query performance**
- [ ] **Test with large datasets**
- [ ] **Monitor memory usage**
- [ ] **Check CPU utilization**

### ✅ Monitoring

- [ ] **Verify logs** are being written correctly
- [ ] **Check monitoring dashboards** are working
- [ ] **Test alert notifications**
- [ ] **Verify uptime monitoring** is active
- [ ] **Check error tracking** is capturing errors

## Maintenance Tasks

### Daily
- [ ] Check application logs for errors
- [ ] Monitor system resources (CPU, memory, disk)
- [ ] Review security alerts

### Weekly
- [ ] Review user activity logs
- [ ] Check database performance metrics
- [ ] Verify backup completion
- [ ] Update dependencies (security patches)

### Monthly
- [ ] Test backup restoration
- [ ] Review and rotate logs
- [ ] Update SSL certificates (if needed)
- [ ] Performance optimization review
- [ ] Security audit

## Rollback Plan

If deployment fails:

1. **Stop the application**
   ```bash
   pm2 stop crm-system
   ```

2. **Restore previous version**
   ```bash
   git checkout <previous-commit>
   npm ci --production
   ```

3. **Restore database backup** (if needed)
   ```bash
   mongorestore --uri="mongodb+srv://..." --archive=backup.archive
   ```

4. **Restart application**
   ```bash
   pm2 restart crm-system
   ```

5. **Verify functionality**

## Emergency Contacts

- **System Administrator**: [contact info]
- **Database Administrator**: [contact info]
- **Development Team Lead**: [contact info]
- **Hosting Provider Support**: [contact info]

## Additional Resources

- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- PM2 Documentation: https://pm2.keymetrics.io/
- Let's Encrypt: https://letsencrypt.org/
- Nginx Documentation: https://nginx.org/en/docs/

---

**Last Updated**: [Date]
**Reviewed By**: [Name]
**Next Review Date**: [Date]
