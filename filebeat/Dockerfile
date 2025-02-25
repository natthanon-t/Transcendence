# Use the official Filebeat image
FROM docker.elastic.co/beats/filebeat:7.10.0

# Copy your custom configuration file into the container
COPY filebeat.yml /etc/filebeat/filebeat.yml

# Install the Filebeat binary
RUN filebeat modules enable system

# Start Filebeat
CMD ["filebeat", "-e"]
