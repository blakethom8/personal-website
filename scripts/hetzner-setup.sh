#!/bin/bash
# Run once on a fresh Hetzner VPS to prepare it for Docker-based deployments.
# Usage: bash hetzner-setup.sh

set -e

apt-get update
apt-get install -y docker.io docker-compose-plugin
apt-get install -y certbot

useradd -m -s /bin/bash deploy
usermod -aG docker deploy

mkdir -p /opt/personal-website
chown deploy:deploy /opt/personal-website

echo "Done. Next steps:"
echo "1. Add your SSH public key to /home/deploy/.ssh/authorized_keys"
echo "2. Clone the repo to /opt/personal-website"
echo "3. Run certbot to provision SSL"
echo "4. Set up the pre-SSL nginx config, then swap to full SSL config after cert is issued"
echo "5. Push to GitHub main to trigger the first CI deploy"
