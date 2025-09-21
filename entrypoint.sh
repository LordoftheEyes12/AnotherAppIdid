#!/bin/sh
set -e


REPO_DIR="/app/myrepo"
GIT_REPO="https://github.com/LordoftheEyes12/Diplomprojekt-WKO.git"
DENO_ENTRYPOINT="main.ts"

if [ ! -d "$REPO_DIR" ]; then
    echo "Cloning repository..."
    git clone "$GIT_REPO" "$REPO_DIR"
else
    echo "Repository already exists. Pulling latest changes..."
    cd "$REPO_DIR" && git pull
fi


cd "$REPO_DIR"

echo "Starting Deno app..."
deno task start
