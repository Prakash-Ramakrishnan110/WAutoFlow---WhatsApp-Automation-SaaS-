# How to Start the Frontend Server

## Quick Start

1. Open PowerShell or Command Prompt
2. Navigate to the frontend folder:
   ```powershell
   cd C:\Users\praka\Desktop\saas\frontend
   ```

3. Start the server:
   ```powershell
   npm run dev
   ```

4. Wait for the message:
   ```
   ✓ Ready in X seconds
   ○ Local: http://localhost:3000
   ```

5. Open your browser and go to:
   - http://localhost:3000
   - or http://localhost:3000/simple (simple test page)

## If Port 3000 is Already in Use

Kill the process using port 3000:
```powershell
netstat -ano | findstr :3000
taskkill /F /PID <PID_NUMBER>
```

Then start the server again.

## Troubleshooting

### Server won't start
- Make sure you're in the `frontend` directory
- Check if `node_modules` exists (if not, run `npm install`)
- Clear cache: `Remove-Item -Recurse -Force .next`

### Page shows 404 errors
- Wait 30 seconds for the server to fully compile
- Hard refresh browser: `Ctrl + Shift + R`
- Clear browser cache

### Black screen
- Check browser console (F12) for errors
- Try the simple page: http://localhost:3000/simple
- Make sure the server shows "Ready" in terminal

