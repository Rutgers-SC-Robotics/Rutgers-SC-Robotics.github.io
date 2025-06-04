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

# Copy all files except the excluded ones to the temporary directory
echo "Copying files to temporary directory..."
find . -type f -not -name "$SCRIPT_NAME" -not -path "*/\.*" | while read -r file; do
    # Create directory structure in temp directory
    mkdir -p "$TEMP_DIR/$(dirname "$file")"
    # Copy the file
    cp "$file" "$TEMP_DIR/$file"
done

# Transfer the files using scp (recursively)
echo "Transferring files to server..."
scp -r "$TEMP_DIR"/* "$SERVER:$REMOTE_PATH/"

SCP_EXIT_CODE=$?

# Clean up temporary directory
echo "Cleaning up temporary directory..."
rm -rf "$TEMP_DIR"

if [ $SCP_EXIT_CODE -eq 0 ]; then
    echo "Website files successfully updated to $SERVER:$REMOTE_PATH"
else
    echo "Error: Failed to update website files"
    exit 1
fi

exit 0
