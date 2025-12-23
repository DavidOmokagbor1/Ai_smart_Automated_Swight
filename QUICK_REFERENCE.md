# 🚀 AI Smart Light Control - Quick Reference

## 🎯 Start the System
```bash
./start.sh
```
*Enhanced startup with automatic error recovery and health monitoring*

## 🔍 Check System Health
```bash
./health_check.sh
```
*Monitors all services and automatically restarts failed ones*

## 🔄 Restart Everything
```bash
./restart_app.sh
```
*Clean restart with complete process cleanup*

## 🛑 Stop All Services
```bash
# Press Ctrl+C in the terminal where you ran ./start.sh
# OR manually kill processes:
pkill -f "react-scripts"
pkill -f "python3 app.py"
```

## 🔧 Quick Troubleshooting

### If Frontend Shows Proxy Errors:
```bash
./health_check.sh
```

### If Services Won't Start:
```bash
./restart_app.sh
```

### If Ports Are Blocked:
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
./start.sh
```

### If AI Mode Isn't Working:
```bash
curl http://localhost:5000/api/ai/status
```

## 📊 Check Individual Services

### Backend Status:
```bash
curl http://localhost:5000/api/status
```

### AI Mode Status:
```bash
curl http://localhost:5000/api/ai/status
```

### Frontend Status:
```bash
curl http://localhost:3000
```

## 🌐 Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: Run `./health_check.sh`

## 🤖 AI Mode Commands

### Enable AI Mode:
```bash
curl -X POST http://localhost:5000/api/ai/mode \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

### Disable AI Mode:
```bash
curl -X POST http://localhost:5000/api/ai/mode \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

### Test AI Mode:
```bash
curl http://localhost:5000/api/ai/test
```

## 📝 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Proxy errors in frontend | Run `./health_check.sh` |
| Port already in use | Run `./restart_app.sh` |
| AI mode not responding | Check backend with `curl http://localhost:5000/api/ai/status` |
| Frontend won't load | Check if port 3000 is free: `lsof -i :3000` |
| Backend won't start | Check if port 5000 is free: `lsof -i :5000` |

## 🎉 Success Indicators

✅ **System is working when you see:**
- No proxy errors in browser console
- AI mode toggle responds immediately
- Real-time light updates
- Health check shows all ✅
- Backend logs show "AI Control running"

## 🚨 Emergency Recovery

If nothing works:
```bash
# 1. Kill everything
pkill -f "react-scripts"
pkill -f "python3 app.py"
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9

# 2. Wait a moment
sleep 5

# 3. Restart fresh
./start.sh
```

---
*💡 Tip: Always use `./start.sh` instead of manually starting services to avoid issues!* 