#!/bin/bash

# Wait until Elasticsearch is available
until curl -s http://localhost:9200 >/dev/null; do
  echo "Waiting for Elasticsearch to start..."
  sleep 5
done

# Create superuser (adjust as necessary)
curl -X POST "http://localhost:9200/_security/user/${ELASTICSEARCH_USERNAME}" -H 'Content-Type: application/json' -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} -d'
{
  "password" : "${ELASTIC_PASSWORD}",
  "roles" : [ "superuser" ],
  "full_name" : "Kibana User",
  "email" : "kibana@example.com"
}'
