#!/bin/sh
# Install curl
apk add --no-cache curl

# Wait for Kibana to be ready
until curl -s http://kibana:5601 >/dev/null; do 
    echo "Waiting for Kibana..."
    sleep 5
done

# Ensure import script exists before executing
if [ -f /usr/share/kibana/data/importalpine.sh ]; then
    sh /usr/share/kibana/data/importalpine.sh
else
    echo "import.sh not found!"
    exit 1
fi
