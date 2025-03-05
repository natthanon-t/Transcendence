#!/bin/bash

# Kibana URL
KIBANA_URL="http://kibana:5601"

# The path to your export.ndjson file inside the container
FILE_PATH="./backup.ndjson"

# Wait until Kibana is available
until curl -s $KIBANA_URL > /dev/null; do
  echo "Waiting for Kibana to be available..."
  sleep 5
done
echo "Current Working Directory: $(pwd)"
echo "File Path: $FILE_PATH"
if [ -f "$FILE_PATH" ]; then
    echo "File exists: $FILE_PATH"
else
    echo "File does not exist: $FILE_PATH"
    exit 1
fi
# Import the NDJSON file into Kibana
echo "Importing saved objects..."
curl -X POST "$KIBANA_URL/api/saved_objects/_import" -H "kbn-xsrf: true" -F "file=@$FILE_PATH"

# Check if the import was successful
if [ $? -eq 0 ]; then
  echo "Import successful!"
else
  echo "Import failed!"
  exit 1
fi
