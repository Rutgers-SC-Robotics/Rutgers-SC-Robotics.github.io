#!/bin/bash

# Script to update website files to a server via SSH
# Usage: ./update_website_files.sh <netid>

# Check if netid is provided
if [ $# -eq 0 ]; then
    echo "Error: NetID is required"
    echo "Usage: ./update_website_files.sh <netid>"
    exit 1
fi

NETID="$1"
SERVER="${NETID}@coewww-static.rutgers.edu"
REMOTE_PATH="/www-static/robotics"
SCRIPT_NAME=$(basename "$0")

echo "Updating files to $SERVER:$REMOTE_PATH"
echo "Excluding: $SCRIPT_NAME and hidden directories/files"

# Create a temporary directory to hold files for transfer
TEMP_DIR=$(mktemp -d)
echo "Creating temporary directory: $TEMP_DIR"

# Stage files to the temporary directory, preserving timestamps
echo "Staging files to temporary directory..."
if command -v rsync >/dev/null 2>&1; then
    rsync -a \
        --exclude="$SCRIPT_NAME" \
        --exclude='.*' \
        --exclude='*/.*' \
        ./ "$TEMP_DIR/"
else
    find . -type f -not -name "$SCRIPT_NAME" -not -path "*/\.*" | while read -r file; do
        mkdir -p "$TEMP_DIR/$(dirname "$file")"
        cp -p "$file" "$TEMP_DIR/$file"
    done
fi

echo "Determining best transfer tool (rclone or rsync)..."

EXIT_CODE=0

if command -v rclone >/dev/null 2>&1; then
    echo "Using rclone to copy only changed files..."
    # Exclude the script itself and hidden files/directories everywhere
    # rclone will compare size and modification time to avoid re-copying unchanged files
    RCLONE_REMOTE=":sftp,host=coewww-static.rutgers.edu,user=${NETID}:$REMOTE_PATH/"
    rclone copy "$TEMP_DIR"/ "$RCLONE_REMOTE" \
        --progress \
        --transfers 8 \
        --checkers 16 \
        --sftp-ask-password \
        --exclude "/**/.**" \
        --exclude "$SCRIPT_NAME"
    EXIT_CODE=$?
elif command -v rsync >/dev/null 2>&1; then
    # Check if rsync exists on the remote host; if not, fall back to scp
    if ssh "$SERVER" "command -v rsync >/dev/null 2>&1"; then
        echo "rclone not found; using rsync to copy only changed files..."
        # rsync uses size+mtime by default to detect changes
        rsync -avz "$TEMP_DIR"/ "$SERVER:$REMOTE_PATH/"
        EXIT_CODE=$?
    else
        echo "Remote rsync not found; falling back to scp..."
        scp -rp "$TEMP_DIR"/* "$SERVER:$REMOTE_PATH/"
        EXIT_CODE=$?
    fi
else
    echo "Neither rclone nor rsync found; falling back to scp (will re-copy everything)..."
    # Transfer the files using scp (recursively) from staged directory
    echo "Transferring files to server..."
    scp -r "$TEMP_DIR"/* "$SERVER:$REMOTE_PATH/"
    EXIT_CODE=$?
fi

echo "Cleaning up temporary directory..."
rm -rf "$TEMP_DIR"

if [ $EXIT_CODE -eq 0 ]; then
    echo "Website files successfully updated to $SERVER:$REMOTE_PATH"
else
    echo "Error: Failed to update website files"
    exit 1
fi

exit 0
