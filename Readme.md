# Eastleigh FC Academy - Full Stack Application

A comprehensive football academy management system built with **Flask** (backend), **React** (frontend), **PostgreSQL** (database), and **Docker** (containerization).

## 🚀 Quick Start (3 Steps)

```bash
# 1. Build and start everything
python tasks.py build
python tasks.py start

# 2. Initialize database with sample data
python tasks.py init

# 3. Open browser
# Frontend: http://localhost:3000
# Admin: Click shield icon or go to http://localhost:3000/#admin
```

## 📋 Task Runner Commands

We provide a convenient Python task runner (`tasks.py`) for all Docker operations:

### 🏗️ Build & Deployment
| Command | Description |
|---------|-------------|
| `python tasks.py build` | Build all Docker images |
| `python tasks.py start` | Start all services |
| `python tasks.py stop` | Stop all services |
| `python tasks.py down` | Stop and remove containers |
| `python tasks.py restart [service]` | Restart all or specific service |
| `python tasks.py reset` | **⚠️ Full reset** (deletes all data) |

### 📊 Monitoring & Debugging
| Command | Description |
|---------|-------------|
| `python tasks.py ps` | List running containers |
| `python tasks.py status` | Detailed system status |
| `python tasks.py logs [service] [-f]` | View logs (add -f to follow) |
| `python tasks.py shell [service]` | Open shell in container |
| `python tasks.py db-shell` | Open PostgreSQL CLI |

### 💾 Database Management
| Command | Description |
|---------|-------------|
| `python tasks.py init` | Initialize with sample data |
| `python tasks.py backup [--filename]` | Create backup (auto-timestamp) |
| `python tasks.py restore --filename X.sql` | Restore from backup |
| `python tasks.py migrate` | Run database migrations |

### 💻 Development
| Command | Description |
|---------|-------------|
| `python tasks.py dev-backend` | Run backend with auto-reload |
| `python tasks.py dev-frontend` | Run frontend dev server (npm) |
| `python tasks.py install` | Install frontend dependencies |
| `python tasks.py update` | Update all dependencies |

### 🧹 Maintenance
| Command | Description |
|---------|-------------|
| `python tasks.py clean` | Clean unused Docker resources |
| `python tasks.py admin` | Show admin access info |
| `python tasks.py help` | Show detailed help |

## 🏗️ Project Structure

```
Eastleigh-united-academy/
├── backend/              # Flask REST API
│   ├── app.py           # Main application
│   ├── models.py        # Database models
│   ├── config.py        # Configuration
│   ├── requirements.txt # Python dependencies
│   ├── Dockerfile       # Backend container
│   └── init_db.py       # Database seeder
├── frontend/            # React SPA
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API integration
│   │   └── App.jsx      # Main app
│   ├── package.json
│   ├── Dockerfile       # Frontend container
│   └── nginx.conf       # Nginx config
├── nginx/
│   └── nginx.conf       # Reverse proxy
├── docker-compose.yml   # Orchestration
├── tasks.py            # 🎯 Task runner
└── README.md           # This file
```

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main website |
| Backend API | http://localhost:5000/api | REST API |
| Admin Panel | http://localhost:3000/#admin | Management interface |
| Database UI | http://localhost:8080 | Adminer (DB management) |

## 👨‍💼 Admin Panel Features

Access via shield icon in navbar or direct URL.

### Manage Squads
- Create/edit/delete squads
- Change formation (4-3-3, 4-4-2, 4-2-3-1, etc.)
- Update head coach & assistant coach names

### Manage Players
- Add new players with stats
- Edit player details (name, age, position, stats)
- **Move players between squads** (dropdown in actions column)
- Delete players

### Review Applications
- View submitted applications
- Update status: pending → reviewed → accepted/rejected

## 📡 API Endpoints

### Squads
```
GET    /api/squads              # List all with players
POST   /api/squads              # Create squad
PUT    /api/squads/<id>         # Update squad
DELETE /api/squads/<id>         # Delete squad
```

### Players
```
GET    /api/players?squad_id=X&position=Y  # List with filters
POST   /api/players             # Create player
PUT    /api/players/<id>        # Update player
DELETE /api/players/<id>        # Delete player
POST   /api/players/<id>/move   # Move to different squad
```

### Applications
```
GET    /api/applications?status=pending    # List applications
POST   /api/applications        # Submit application
PUT    /api/applications/<id>/status       # Update status
```

## 🔄 Common Workflows

### First Time Setup
```bash
python tasks.py build
python tasks.py start
python tasks.py init
```

### Daily Development
```bash
python tasks.py start          # Start services
python tasks.py logs backend -f  # Watch backend logs
# Edit code → changes auto-reload
python tasks.py stop           # Stop when done
```

### Add New Player
1. Go to http://localhost:3000/#admin
2. Click "Players" tab → "Add Player"
3. Fill details → Submit
4. View on main site immediately

### Move Player to Different Squad
1. Admin Panel → Players tab
2. Find player in table
3. Use "Move to [Squad]" dropdown in Actions column
4. Player instantly appears in new squad lineup

### Backup Before Major Changes
```bash
python tasks.py backup --filename=before_changes.sql
# Make changes...
# If something breaks:
python tasks.py restore --filename=before_changes.sql
```

### Full Reset (Clean Slate)
```bash
python tasks.py backup --filename=final_backup.sql  # Optional
python tasks.py reset  # Stops, removes volumes, rebuilds, restarts
python tasks.py init   # Re-initialize with sample data
```

## 🐳 Direct Docker Commands (if not using tasks.py)

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Database CLI
docker-compose exec db psql -U postgres -d eastleigh_academy

# Backup
docker-compose exec -T db pg_dump -U postgres eastleigh_academy > backup.sql

# Restore
docker-compose exec -T db psql -U postgres eastleigh_academy < backup.sql
```

## 🛠️ Development Without Docker

### Backend Only
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
python app.py  # Runs on http://localhost:5000
```

### Frontend Only
```bash
cd frontend
npm install
npm start  # Runs on http://localhost:3000
```

## ⚠️ Troubleshooting

### Port Already in Use
```bash
# Find what's using port 5000, 3000, or 5432
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows (then taskkill /PID <pid> /F)
```

### Database Connection Failed
```bash
python tasks.py ps        # Check if db is running
python tasks.py logs db   # Check db logs
python tasks.py restart db
```

### Changes Not Showing
```bash
# Frontend cached? Hard refresh: Ctrl+Shift+R
# Backend changes? python tasks.py restart backend
# Full rebuild? python tasks.py reset
```

### Permission Denied (Linux/Mac)
```bash
chmod +x tasks.py  # Make executable
./tasks.py start   # Run directly
```

## 🔒 Security Checklist for Production

### ✅ Environment Variables Setup
1. **Copy `.env.example` to `.env`**:
   ```bash
   cp .env.example .env
   ```

2. **Generate secure SECRET_KEY**:
   ```bash
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```
   Replace the value in `.env`

3. **Set strong passwords** in `.env`:
   - `POSTGRES_PASSWORD`: Use a strong, random password
   - `ADMIN_PASSWORD`: Use a secure admin password
   - `SECRET_KEY`: Use the generated secret key

### ⚠️ Critical Security Notes
- **Never commit `.env` files** - they're in `.gitignore`
- **Change all default passwords** before going live
- **Use HTTPS** in production (configure nginx SSL)
- **Restrict CORS** origins in production
- **Regular backups**:
  ```bash
  python tasks.py backup --filename=prod_$(date +%Y%m%d).sql
  ```

### 🔐 Admin Panel Security
- Admin credentials are now loaded from environment variables
- Default admin: `admin` / `secure_admin_password_2024` (change immediately!)
- Consider implementing proper authentication (JWT, OAuth) for production

## � Deployment Guide

### Quick Deploy to Railway (Recommended)

1. **Create Railway Account**: https://railway.app

2. **Connect Repository**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `eastleigh-united-fc` repository

3. **Configure Environment Variables**:
   ```
   SECRET_KEY=your-generated-secret-key-here
   POSTGRES_PASSWORD=your-secure-db-password
   REACT_APP_API_URL=https://your-backend-url.up.railway.app
   REACT_APP_ADMIN_USERNAME=admin
   REACT_APP_ADMIN_PASSWORD=your-secure-admin-password
   ```

4. **Deploy**: Railway will automatically detect and deploy your Docker setup

5. **Access Your Site**: Get the frontend URL from Railway dashboard

### Alternative: Deploy to Render

1. **Create Render Account**: https://render.com

2. **Create Services**:
   - PostgreSQL database
   - Web service for backend (Docker)
   - Web service for frontend (Docker)

3. **Set Environment Variables** in each service

### Production Environment Setup

```bash
# Generate secure secret key
python3 -c "import secrets; print(secrets.token_hex(32))"

# Set these environment variables in your hosting platform:
SECRET_KEY=<generated-key>
POSTGRES_PASSWORD=<strong-password>
REACT_APP_API_URL=<your-backend-url>
REACT_APP_ADMIN_USERNAME=<admin-username>
REACT_APP_ADMIN_PASSWORD=<secure-admin-password>
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database password changed from default
- [ ] Admin password changed from default
- [ ] SECRET_KEY generated and set
- [ ] CORS origins configured for production domain
- [ ] HTTPS enabled
- [ ] Domain configured (optional)

## �📝 Database Schema

### Squads
- `id`, `name`, `age_group`, `formation`, `head_coach`, `assistant_coach`, `created_at`

### Players
- `id`, `first_name`, `last_name`, `age`, `position`, `squad_id`
- `stats_goals`, `stats_assists`, `stats_matches`
- `image_url`, `quote`, `is_active`, `created_at`

### Applications
- `id`, `first_name`, `last_name`, `date_of_birth`, `position`
- `previous_club`, `email`, `phone`, `message`, `status`, `created_at`

## 🆘 Getting Help

```bash
# Show all available commands
python tasks.py help

# Check system status
python tasks.py status

# View specific service logs
python tasks.py logs backend -f
python tasks.py logs frontend -f
python tasks.py logs db -f
```

## 📄 License

MIT License - Customize for your football academy.

---

**Built with ❤️ for Eastleigh FC Academy**
**Task Runner Version: 1.0.0**
```