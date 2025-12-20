# Deployment Guide

## Production Deployment Checklist

### 1. Environment Configuration

Update `.env` for production:
```env
NODE_ENV=production
PORT=5000

# Database - Use production credentials
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=elearning_platform
DB_USER=your-production-db-user
DB_PASSWORD=your-secure-password

# JWT - Use strong secret
JWT_SECRET=generate-a-very-strong-secret-key-here
JWT_EXPIRE=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# CORS - Restrict to your frontend domain
ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Database Setup

#### PostgreSQL Production Setup

```bash
# Connect to PostgreSQL
psql -U postgres -h your-db-host

# Create database
CREATE DATABASE elearning_platform;

# Create user with password
CREATE USER elearning_user WITH PASSWORD 'strong_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE elearning_platform TO elearning_user;

# Exit
\q
```

#### Initialize Schema

```bash
npm run db:init
```

### 3. Security Enhancements

#### Add Rate Limiting

```bash
npm install express-rate-limit
```

Add to `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### Add Helmet for Security Headers

```bash
npm install helmet
```

Add to `server.js`:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

#### Add CORS Restrictions

Update CORS in `server.js`:
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
};
app.use(cors(corsOptions));
```

### 4. Production Server Setup

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name elearning-api

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

#### PM2 Commands

```bash
# View logs
pm2 logs elearning-api

# Restart
pm2 restart elearning-api

# Stop
pm2 stop elearning-api

# Monitor
pm2 monit

# View status
pm2 status
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/elearning-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload size limit
    client_max_body_size 10M;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/elearning-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 7. File Storage

For production, consider using cloud storage:

#### AWS S3 Example

```bash
npm install aws-sdk multer-s3
```

Update `middleware/upload.js` for S3:
```javascript
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});
```

### 8. Logging

#### Add Winston for Production Logging

```bash
npm install winston
```

Create `config/logger.js`:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### 9. Database Backups

#### Automated PostgreSQL Backups

Create backup script `/scripts/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="elearning_platform"

mkdir -p $BACKUP_DIR

pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### 10. Monitoring

#### Add Health Check Endpoint

Add to `server.js`:
```javascript
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', timestamp: new Date() });
  } catch (error) {
    res.status(503).json({ status: 'ERROR', message: 'Database connection failed' });
  }
});
```

### 11. Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: elearning_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with Docker:
```bash
docker-compose up -d
```

### 12. Performance Optimization

#### Database Indexing

Add indexes to frequently queried columns:
```sql
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_reviews_course ON reviews(course_id);
CREATE INDEX idx_lessons_section ON lessons(section_id);
```

#### Connection Pooling

Update `config/database.js`:
```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 13. Deployment Platforms

#### Heroku
```bash
heroku create elearning-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

#### DigitalOcean App Platform
- Connect GitHub repository
- Set environment variables
- Deploy automatically

#### AWS EC2
- Launch Ubuntu instance
- Install Node.js, PostgreSQL, Nginx
- Clone repository
- Setup PM2 and Nginx as shown above

### 14. Post-Deployment Testing

```bash
# Test health endpoint
curl https://api.yourdomain.com/health

# Test API endpoints
curl https://api.yourdomain.com/api/categories
```

### 15. Maintenance

- Monitor server resources (CPU, RAM, Disk)
- Check application logs regularly
- Update dependencies monthly
- Backup database daily
- Monitor error rates
- Setup uptime monitoring (UptimeRobot, Pingdom)

## Environment Variables Summary

Required for production:
- `NODE_ENV=production`
- `PORT`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (strong random string)
- `JWT_EXPIRE`
- `MAX_FILE_SIZE`
- `ALLOWED_ORIGINS` (comma-separated list)

## Support & Troubleshooting

Common issues:
1. **Database connection fails**: Check credentials and firewall rules
2. **File uploads fail**: Check directory permissions and size limits
3. **CORS errors**: Update ALLOWED_ORIGINS
4. **JWT errors**: Verify JWT_SECRET is set correctly
5. **Port already in use**: Change PORT or kill existing process
