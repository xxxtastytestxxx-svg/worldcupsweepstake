# Live Score Auto-Updater

This folder contains the `updater.js` Node.js script. It fetches live data from `football-data.org` every 2 minutes and securely pushes updates to your existing Firebase database.

## 1. Local Testing

If you want to run it on your own computer while games are playing, you just need Node.js installed.
1. Open a terminal in this `live-updater` directory.
2. Run `npm install`
3. Run `npm start` (the API key is already hardcoded in the script).

As long as that terminal is open, the scores will update automatically!

## 2. Deploying Continuously (Free) to Render.com

To have this run 24/7 without needing your computer on, we recommend Render.com:

1. **Upload to GitHub**: Push this entire `live-updater` folder to a new GitHub repository (can be private).
2. **Sign up**: Go to [Render.com](https://render.com) and sign in with GitHub.
3. **New Web Service**: Click "New" -> "Web Service".
4. **Connect Repo**: Select the repository you just created.
5. **Configuration**:
   - **Name**: worldcup-updater
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
6. **Environment Variables**:
   - Scroll down to "Environment Variables" and add:
     - Key: `FOOTBALL_DATA_API_KEY`
     - Value: `YOUR_ACTUAL_API_KEY_HERE`
7. **Create Service**: Click "Create Web Service".

**Note on Free Tier Sleeping:**
Render's free tier goes to sleep after 15 minutes of inactivity. Since this script makes outward requests, Render might put it to sleep. To prevent this, go to [cron-job.org](https://cron-job.org/), sign up for a free account, and create a cron job that visits your Render Web Service URL (e.g. `https://worldcup-updater.onrender.com`) every 10 minutes. This will keep the script awake indefinitely.

Alternatively, you can just turn on your computer and run it locally during match days!
