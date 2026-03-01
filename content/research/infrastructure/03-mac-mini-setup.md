# Mac Mini Setup Guide: From Unboxing to Running Agents

## Overview

This guide walks through setting up a Mac Mini M4 as a dedicated, headless AI agent server running OpenClaw, connected to your MacBook Pro via Tailscale. The goal: a machine that runs 24/7, handles all your agent workloads, and is accessible from anywhere.

**Time estimate**: 2-3 hours for full setup
**Difficulty**: Intermediate (comfortable with Terminal)
**Prerequisites**: Mac Mini, Ethernet cable (or strong Wi-Fi), Anthropic API key, a monitor/keyboard for initial setup (can return them after)

---

## Phase 1: Initial macOS Setup (30 minutes)

### 1.1 Physical Setup

1. Unbox Mac Mini, connect power, Ethernet cable to router
2. Connect a monitor and keyboard for initial setup (temporary)
3. Power on, complete macOS setup wizard:
   - Create an admin account (this will be your primary user)
   - Enable location services (needed for timezone)
   - Skip Apple ID sign-in (or sign in — your call, but not required)
   - Skip screen time, Siri, analytics

### 1.2 Essential System Settings

Open System Settings and configure:

```
General → About
   └── Note the computer name (e.g., "blakes-mac-mini")
       You'll use this for Tailscale MagicDNS

General → Software Update
   └── Enable automatic updates (security updates are important)

Energy
   └── "Prevent automatic sleeping when the display is off" → ON
   └── "Wake for network access" → ON
   └── "Start up automatically after power failure" → ON
       (These keep the Mini running 24/7)

Network → Ethernet
   └── Verify connected, note IP address
   └── Consider setting a static local IP on your router

Sharing → Remote Login (SSH)
   └── Enable it
   └── Allow access for: your admin user only
       (This lets you SSH in from the MacBook)

Sharing → Screen Sharing
   └── Enable it (useful for initial setup, can disable later)
   └── Allow access for: your admin user only
```

### 1.3 Security Hardening (First Pass)

```
Privacy & Security → FileVault
   └── Turn On FileVault (encrypts the entire disk)
   └── Save the recovery key somewhere safe (NOT on the Mini)

Privacy & Security → Firewall
   └── Turn on (blocks incoming connections except SSH and Screen Sharing)

Lock Screen
   └── Require password: Immediately
   └── (Even though headless, good practice)
```

### 1.4 Remove the Monitor

After enabling SSH and Screen Sharing, you can disconnect the monitor and keyboard. From now on, all management happens remotely.

Test SSH from your MacBook while still on the same network:
```bash
ssh yourusername@<mini-local-ip>
```

If this works, you're good to go headless.

---

## Phase 2: Tailscale Setup (15 minutes)

### 2.1 Install on Mac Mini

SSH into the Mini:
```bash
ssh yourusername@<mini-local-ip>
```

Install Tailscale:
```bash
# Download and install via Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install --cask tailscale
```

Or download the .dmg from https://tailscale.com/download/mac

Start Tailscale (if installed via .dmg, you may need to use Screen Sharing for the GUI login):
```bash
# If using Tailscale CLI
tailscale up

# Or open the app via Screen Sharing for OAuth login
```

### 2.2 Install on MacBook Pro

If not already installed:
```bash
brew install --cask tailscale
```

Open Tailscale, log in with the same account as the Mac Mini.

### 2.3 Verify Connection

On your MacBook:
```bash
# Check that both devices appear
tailscale status

# Try SSHing via Tailscale IP
ssh yourusername@100.64.x.2  # (Mac Mini's Tailscale IP)

# Or via MagicDNS
ssh yourusername@blakes-mac-mini
```

### 2.4 Configure ACLs

In the Tailscale admin console (https://login.tailscale.com/admin/acls), add:

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["tag:laptop"],
      "dst": ["tag:agent-server:22,18789"]
    }
  ],
  "tagOwners": {
    "tag:laptop": ["autogroup:admin"],
    "tag:agent-server": ["autogroup:admin"]
  }
}
```

Then tag your devices:
- MacBook Pro → `tag:laptop`
- Mac Mini → `tag:agent-server`

This means: the laptop can reach the agent server on SSH (22) and OpenClaw gateway (18789). Nothing else.

---

## Phase 3: Development Environment (30 minutes)

### 3.1 Install Core Tools

SSH into the Mini:
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew (if not done in Phase 2)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Essential tools
brew install git node python3 jq wget

# Docker (use Colima instead of Docker Desktop to save ~6GB RAM)
brew install colima docker docker-compose
colima start --cpu 4 --memory 4

# Whisper for local transcription
pip3 install openai-whisper

# yt-dlp for media processing
pip3 install yt-dlp
```

### 3.2 Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Generate SSH key for GitHub
ssh-keygen -t ed25519 -C "mac-mini-agent"
cat ~/.ssh/id_ed25519.pub
# Add this to GitHub Settings → SSH Keys
```

### 3.3 Configure Shell

```bash
# If you prefer zsh (default on macOS)
# Add to ~/.zshrc:
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
echo 'export ANTHROPIC_API_KEY="your-key-here"' >> ~/.zshrc
source ~/.zshrc
```

---

## Phase 4: OpenClaw Installation (30 minutes)

### 4.1 Install OpenClaw

```bash
# Install via npm
npm install -g openclaw

# Verify installation
openclaw --version
```

### 4.2 Initial Configuration

Run the setup wizard:
```bash
openclaw setup
```

Or manually create the configuration:
```bash
mkdir -p ~/openclaw
ln -s ~/openclaw ~/.openclaw
```

### 4.3 Configure openclaw.json

Create/edit `~/openclaw/openclaw.json` with the Mac Mini-specific configuration:

```json
{
  "version": "2026.2.x",
  "auth": {
    "profiles": {
      "anthropic": {
        "provider": "anthropic",
        "apiKey": "sk-ant-..."
      }
    },
    "default": "anthropic"
  },
  "model": {
    "default": "anthropic/claude-sonnet-4-5",
    "fallbacks": ["anthropic/claude-opus-4-5"]
  },
  "workspace": {
    "path": "/Users/yourusername/openclaw/workspace"
  },
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "tailscale",
    "auth": {
      "mode": "token",
      "token": "generate-a-strong-random-token-here"
    },
    "tailscale": {
      "mode": "userspace",
      "resetOnExit": false
    }
  },
  "contextPruning": {
    "mode": "cache-ttl",
    "ttl": 3600
  },
  "agents": {
    "maxConcurrent": 4,
    "subagents": {
      "maxConcurrent": 8
    }
  },
  "heartbeat": {
    "interval": 1800
  }
}
```

Key differences from the MacBook config:
- `gateway.bind` → `"tailscale"` (accessible over Tailscale, not just localhost)
- `gateway.tailscale.mode` → `"userspace"` (enable Tailscale integration)
- Generate a **new, unique** gateway token (don't reuse the MacBook's token)

### 4.4 Set Up Workspace Structure

```bash
mkdir -p ~/openclaw/workspace/{memory,reports,scripts}
```

Copy core context files from MacBook (via SCP or rsync):
```bash
# Run this on your MacBook:
rsync -av ~/openclaw/workspace/SOUL.md \
          ~/openclaw/workspace/USER.md \
          ~/openclaw/workspace/WORK.md \
          ~/openclaw/workspace/TOOLS.md \
          ~/openclaw/workspace/AGENTS.md \
          yourusername@blakes-mac-mini:~/openclaw/workspace/
```

### 4.5 Configure Telegram (If Using)

If you want Telegram messages routed to the Mac Mini instead of the MacBook:

1. Move the Telegram bot token to the Mini's `openclaw.json`
2. Remove it from the MacBook's config (or keep both with different bot accounts)
3. Only ONE instance should poll the same Telegram bot at a time

### 4.6 Start the Gateway

```bash
# Start the gateway
openclaw gateway start

# Verify it's running
curl -H "Authorization: Bearer your-token" http://localhost:18789/health
```

From your MacBook, verify Tailscale access:
```bash
curl -H "Authorization: Bearer your-token" http://100.64.x.2:18789/health
```

---

## Phase 5: Auto-Start on Boot (15 minutes)

### 5.1 Create a Launch Agent

The Mac Mini should start OpenClaw automatically on boot:

```bash
mkdir -p ~/Library/LaunchAgents
```

Create `~/Library/LaunchAgents/com.openclaw.gateway.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.openclaw.gateway</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/openclaw</string>
        <string>gateway</string>
        <string>start</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/yourusername/openclaw/logs/gateway-stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/yourusername/openclaw/logs/gateway-stderr.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
        <key>HOME</key>
        <string>/Users/yourusername</string>
    </dict>
</dict>
</plist>
```

Load it:
```bash
mkdir -p ~/openclaw/logs
launchctl load ~/Library/LaunchAgents/com.openclaw.gateway.plist
```

### 5.2 Verify Auto-Start

Reboot the Mac Mini and verify:
```bash
sudo reboot

# Wait 2 minutes, then from MacBook:
ssh yourusername@blakes-mac-mini "launchctl list | grep openclaw"
curl -H "Authorization: Bearer your-token" http://blakes-mac-mini:18789/health
```

---

## Phase 6: Validation Checklist

Before declaring the setup complete, verify each layer:

### Networking
- [ ] Mac Mini accessible via Tailscale IP from MacBook
- [ ] Mac Mini accessible via MagicDNS name from MacBook
- [ ] SSH works from coffee shop Wi-Fi (test with phone hotspot)
- [ ] ACLs properly restrict access (try from a port that should be blocked)

### OpenClaw
- [ ] Gateway starts on boot
- [ ] Gateway responds to health check over Tailscale
- [ ] Agent session can be started via gateway API
- [ ] Telegram messages route to Mac Mini (if configured)
- [ ] Heartbeat cron fires every 30 minutes
- [ ] Memory files are being written to `~/openclaw/workspace/memory/`

### Security
- [ ] FileVault is enabled (disk encryption)
- [ ] Firewall is enabled
- [ ] SSH uses key-based auth (password auth disabled)
- [ ] Tailscale ACLs only allow laptop → agent-server on ports 22, 18789
- [ ] Gateway token is unique (not shared with MacBook)
- [ ] No ports forwarded on home router

### Performance
- [ ] RAM usage at idle < 4GB
- [ ] Agent session completes without throttling
- [ ] Whisper transcription works locally
- [ ] Docker containers start successfully (Colima)

---

## Maintenance Runbook

### Daily (Automated)
- OpenClaw heartbeat runs every 30 minutes
- Memory files appended to daily log
- Docker containers cleaned up after use

### Weekly (Manual, 5 minutes)
```bash
# SSH in and check
ssh yourusername@blakes-mac-mini

# Check logs for errors
tail -50 ~/openclaw/logs/gateway-stderr.log

# Check disk usage
df -h

# Check memory
vm_stat | head -5
```

### Monthly (Manual, 15 minutes)
```bash
# Update macOS
softwareupdate --install --all

# Update Homebrew packages
brew update && brew upgrade

# Update OpenClaw
npm update -g openclaw

# Update Python tools
pip3 install --upgrade openai-whisper yt-dlp

# Clean Docker
colima ssh -- docker system prune -f
```

### If Something Breaks
1. SSH into Mini: `ssh yourusername@blakes-mac-mini`
2. Check gateway: `launchctl list | grep openclaw`
3. Check logs: `tail -100 ~/openclaw/logs/gateway-stderr.log`
4. Restart gateway: `openclaw gateway restart`
5. Nuclear option: `sudo reboot` (auto-start will recover)

---

## What You're Left With

After ~2-3 hours, you have:

- A headless Mac Mini running OpenClaw 24/7
- Encrypted connection from your laptop via Tailscale
- Agents that keep running when you close your laptop
- Background processing (Whisper, data analysis) offloaded from your daily driver
- Automatic restart on power failure or reboot
- Defense-in-depth security (Tailscale + ACLs + token auth + FileVault + firewall)

Cost: ~$800 one-time, ~$1.50/month electricity, $0/month for Tailscale.

Your laptop is now lighter, cooler, and faster — because the heavy agent work happens somewhere else.
