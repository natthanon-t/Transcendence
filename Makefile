COMPOSE_FILE_PATH = ./docker-compose.yml
PROJECT_NAME = transcendence
KIBANA_CONTAINER_NAME=elasticsearch
SCRIPT_PATH=/usr/share/elasticsearch/data/createuser.sh
# Default target
all: up

restart: down up
# Build the docker images and the containers and start them
firstup: up run-script

up:
	@docker compose -f ${COMPOSE_FILE_PATH} -p ${PROJECT_NAME} up -d --build

# Stop the containers and remove them
down:
	@docker compose -f ${COMPOSE_FILE_PATH} -p ${PROJECT_NAME} down --remove-orphans
	@rm -rf back/transcendence/transcendence/__pycache__
	@rm -rf back/transcendence/user_management/__pycache__ back/transcendence/user_management/migrations

# Clean all Docker resources and the data folder
clean: down hard_clean
	docker network prune -f
	docker system prune -f -a
	docker volume prune -f

re: clean all

re_soft: down all

# Clean all Docker resources
# WARNING: This will remove all containers, images, volumes and networks from your system
hard_clean:
	@echo "Cleaning up Docker resources..."
	@echo "Stopping containers..."
	@docker stop $$(docker ps -qa) 2>/dev/null || true
	@echo "Removing containers..."
	@docker rm $$(docker ps -qa) 2>/dev/null || true
	@echo "Removing images..."
	@docker rmi -f $$(docker images -qa) 2>/dev/null || true
	@echo "Removing volumes..."
	@docker volume rm $$(docker volume ls -q) 2>/dev/null || true
	@echo "Removing networks..."
	@docker network rm $$(docker network ls -q) 2>/dev/null || true
	@echo "\033[32mAll Docker resources have been cleaned.\033[0m"

pullimages:
	@docker pull nginx
	@docker pull postgres
	@docker pull prom/prometheus
	@docker pull grafana/grafana:11.4.2-ubuntu
	@docker pull adminer
	@docker pull vault
	@docker pull prom/node-exporter
	@docker pull wrouesnel/postgres_exporter
	@docker pull nginx/nginx-prometheus-exporter
	@docker pull docker.elastic.co/logstash/logstash:7.10.0
	@docker pull docker.elastic.co/elasticsearch/elasticsearch:7.10.0
	@docker pull docker.elastic.co/kibana/kibana:7.10.0
	@docker pull alpine

saveimages:
	@docker save -o nginx.tar nginx
	@docker save -o postgres.tar postgres
	@docker save -o prometheus.tar prom/prometheus
	@docker save -o grafana.tar grafana/grafana
	@docker save -o adminer.tar adminer
	@docker save -o vault.tar vault
	@docker save -o node_exporter.tar prom/node-exporter
	@docker save -o postgres_exporter.tar wrouesnel/postgres_exporter
	@docker save -o kibana.tar docker.elastic.co/kibana/kibana
	@docker save -o logstash.tar docker.elastic.co/logstash/logstash
	@docker save -o elasticsearch.tar docker.elastic.co/elasticsearch/elasticsearch
	@docker save -o nginx_exporter.tar nginx/nginx-prometheus-exporter
	@docker save -o alpine.tar alpine


loadimages:
	@docker load -i nginx.tar
	@docker load -i postgres.tar
	@docker load -i prometheus.tar
	@docker load -i grafana.tar
	@docker load -i adminer.tar
	@docker load -i node_exporter.tar
	@docker load -i postgres_exporter.tar
	@docker load -i nginx_exporter.tar
	@docker load -i kibana.tar
	@docker load -i elasticsearch.tar
	@docker load -i logstash.tar
	@docker load -i alpine.tar

run-script:
	@echo "Waiting for 2 minutes..."
	@sleep 120  # Sleep for 120 seconds (2 minutes)
	@echo "Proceeding to next step..."
	@docker exec -it $(KIBANA_CONTAINER_NAME) /bin/sh $(SCRIPT_PATH)
	@docker start alpine-setup

.PHONY: all up down clean re re_soft hard_clean run-script loadimages saveimages pullimages
