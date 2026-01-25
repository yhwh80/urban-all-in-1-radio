# Git Workflow Guide

## Repository Structure

You have **TWO separate Git repositories**:

| Repository | Local Path | GitHub Remote |
|------------|------------|---------------|
| **Website** | `/Users/devadmin/urban-all-in-1-radio` | `yhwh80/urban-all-in-1-radio.git` |
| **AI DJ** | `/Users/devadmin/urban-all-in-1-radio/ai-dj-mixer` | `yhwh80/ai-dj-server.git` |

> ⚠️ **Important**: The `ai-dj-mixer` folder is INSIDE the website folder, but it's a completely separate git repo that pushes to a different GitHub repository!

---

## Pushing Website Changes

For website files (HTML, CSS, JS, images):

```bash
cd /Users/devadmin/urban-all-in-1-radio
git status                              # Check what's changed
git add .                               # Stage all changes
git commit -m "Your message here"       # Commit
git push origin main                    # Push to GitHub
```

---

## Pushing AI DJ Changes

For AI DJ code (Python files, Liquidsoap config, etc.):

```bash
cd /Users/devadmin/urban-all-in-1-radio/ai-dj-mixer
git status                              # Check what's changed
git add .                               # Stage all changes
git commit -m "Your message here"       # Commit
git push origin main                    # Push to GitHub
```

Then in **Coolify**: Click **Redeploy** on the ai-dj-server service.

---

## Quick Reference Commands

### Check status
```bash
# Website
cd /Users/devadmin/urban-all-in-1-radio && git status

# AI DJ
cd /Users/devadmin/urban-all-in-1-radio/ai-dj-mixer && git status
```

### View recent commits
```bash
git log --oneline -10
```

### Check which remote you're pushing to
```bash
git remote -v
```

---

## Common Scenarios

### "I edited AI DJ code but nothing changed on the server"
1. Make sure you're in the `ai-dj-mixer` folder (not the parent)
2. Run `git status` to see if changes are staged
3. Commit and push
4. **Redeploy in Coolify** — this is required for changes to take effect!

### "I'm not sure which repo I'm in"
```bash
git remote -v
```
- If it shows `urban-all-in-1-radio.git` → you're in the website repo
- If it shows `ai-dj-server.git` → you're in the AI DJ repo

---

## Last Known Good Commits

| Repo | Commit | Message | Date |
|------|--------|---------|------|
| Website | `9393f9a` | Add Open Graph meta tags, favicon, and social preview images | Jan 2026 |
| AI DJ | `d510bf2` | Tune DJ prompts: shorter scripts, more variety, expanded artist list | Jan 2026 |

