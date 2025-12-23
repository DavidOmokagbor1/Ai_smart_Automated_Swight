# AI Mode Troubleshooting Guide

## Common Issues and Solutions

### 1. AI Mode Toggle Not Working

**Symptoms:**
- AI mode button doesn't respond
- Error messages appear when toggling
- State doesn't update properly

**Solutions:**
1. **Restart the application cleanly:**
   ```bash
   ./restart_app.sh
   ```

2. **Check if servers are running:**
   ```bash
   # Check backend (should show Python process)
   ps aux | grep "python3 app.py"
   
   # Check frontend (should show React process)
   ps aux | grep "react-scripts"
   ```

3. **Clear browser cache and reload:**
   - Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
   - Or open Developer Tools → Application → Clear Storage

### 2. Multiple React Servers Running

**Symptoms:**
- Port 3000 already in use error
- Multiple browser tabs opening
- Inconsistent behavior

**Solutions:**
1. **Kill all React processes:**
   ```bash
   pkill -f "react-scripts"
   pkill -f "node.*start"
   ```

2. **Kill processes on specific ports:**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   ```

3. **Use the restart script:**
   ```bash
   ./restart_app.sh
   ```

### 3. Network Connection Issues

**Symptoms:**
- "Network error" messages
- API calls failing
- Socket connection errors

**Solutions:**
1. **Check if backend is accessible:**
   ```bash
   curl http://localhost:5000/api/status
   ```

2. **Check if frontend is accessible:**
   ```bash
   curl http://localhost:3000
   ```

3. **Verify CORS settings:**
   - Backend should allow requests from `http://localhost:3000`
   - Check browser console for CORS errors

### 4. State Synchronization Issues

**Symptoms:**
- AI mode state doesn't match between frontend and backend
- Toggle button shows wrong state
- Inconsistent behavior after page refresh

**Solutions:**
1. **Force refresh AI status:**
   - The app now automatically refreshes AI status after toggling
   - Wait 1-2 seconds after toggling before checking state

2. **Check browser console for errors:**
   - Open Developer Tools (F12)
   - Look for error messages in Console tab

3. **Verify backend state:**
   ```bash
   curl http://localhost:5000/api/ai/status
   ```

### 5. Socket Connection Issues

**Symptoms:**
- Real-time updates not working
- AI predictions not showing
- Socket connection errors in console

**Solutions:**
1. **Check socket connection:**
   - Look for "Connected to AI Light Control System" message
   - Check browser console for socket errors

2. **Restart with clean socket connections:**
   ```bash
   ./restart_app.sh
   ```

3. **Check firewall settings:**
   - Ensure ports 3000 and 5000 are not blocked
   - Check if antivirus is blocking connections

## Debug Information

### Frontend Debug Info
The app now includes debug information that updates every 5 seconds:
- Current timestamp
- AI mode enabled state
- Loading state
- Number of lights configured

### Backend Logs
Check backend logs for detailed error information:
```bash
# If running in terminal, logs will appear there
# Look for lines starting with ERROR or WARNING
```

### Common Error Messages

1. **"Error toggling AI mode"**
   - Usually a network connectivity issue
   - Check if backend is running on port 5000

2. **"Network error: Unable to toggle AI mode"**
   - Backend server is not responding
   - Restart the backend server

3. **"Port 3000 already in use"**
   - Multiple React servers running
   - Use the restart script to clean up

4. **"Socket emit failed"**
   - WebSocket connection issues
   - Usually resolves with a page refresh

## Quick Fixes

### Immediate Solutions:
1. **Page refresh:** Press F5 or Ctrl+R
2. **Clear browser cache:** Ctrl+Shift+R
3. **Restart application:** `./restart_app.sh`
4. **Check network:** Ensure both servers are running

### If Nothing Works:
1. **Complete restart:**
   ```bash
   pkill -f "react-scripts"
   pkill -f "python3 app.py"
   sleep 5
   ./restart_app.sh
   ```

2. **Check system resources:**
   ```bash
   # Check CPU and memory usage
   top
   
   # Check disk space
   df -h
   ```

3. **Verify dependencies:**
   ```bash
   # Backend dependencies
   cd backend && pip3 install -r requirements.txt
   
   # Frontend dependencies
   cd frontend && npm install
   ```

## Prevention Tips

1. **Always use the restart script** when starting the application
2. **Don't run multiple instances** of the same server
3. **Check console logs** regularly for warnings
4. **Keep browser cache cleared** during development
5. **Monitor system resources** if issues persist

## Getting Help

If you continue to experience issues:

1. **Collect debug information:**
   - Browser console logs
   - Backend terminal output
   - System resource usage

2. **Document the steps:**
   - What you were doing when the error occurred
   - Exact error messages
   - Steps to reproduce the issue

3. **Check the logs:**
   - Backend logs in the terminal
   - Browser console logs (F12 → Console)
   - Network tab for failed requests 