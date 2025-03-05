#!/bin/bash

# Import the saved objects (dashboard + index pattern)
#curl -X POST "http://localhost:5601/api/saved_objects/_import" -H "kbn-xsrf: true" -F "file=@/usr/share/kibana/config/export.ndjson"

# Create index pattern using Kibana API
curl -X POST "http://localhost:5601/api/saved_objects/index-pattern/nginx-*" \
-H "kbn-xsrf: true" \
-H "Content-Type: application/json" \
-d @/usr/share/kibana/config/index-pattern.json

# Start Kibana
#/usr/share/kibana/bin/kibana
