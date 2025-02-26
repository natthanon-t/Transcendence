FROM grafana/grafana:11.4.2-ubuntu

USER root

# Set working directory
WORKDIR /etc/grafana

# Install openssl for certificate generation
RUN apt-get update && apt-get install -y openssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
    -keyout /etc/grafana/server.key -out /etc/grafana/server.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=Department/CN=localhost"

# Set correct permissions for certificate and key
RUN chmod 644 /etc/grafana/server.key /etc/grafana/server.crt

# Copy custom Grafana configuration
COPY grafana.ini /etc/grafana/grafana.ini

USER grafana
# Expose HTTPS port
EXPOSE 3000

# Run Grafana
CMD ["/run.sh"]
