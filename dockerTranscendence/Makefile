include .env
NAMES = postgres nestjs nodejs 
VOL =  postgresqldb
NETWORK = transcendence

LOCAL_FOLDER = ~/data/
VOL_FOLDERS = $(addprefix $(LOCAL_FOLDER), $(VOL))

IMAGES = $(NAMES)
CONTAINERS = $(addsuffix _transcendence ,$(NAMES))
VOLUMES = $(addsuffix _vol_transcendence, $(VOL))

BACKUP_FOLDER = ./backup_db

all: up

sql_backup:
	@echo "Backing up the database..."
	@docker exec -it postgres_transcendence pg_dumpall -c -U ${POSTGRES_USER} > $(BACKUP_FOLDER)/backup_db.sql
	@echo "Backup complete."

sql_install:
	@echo "Installing the database..."
	@mkdir -p $(VOL_FOLDERS) || true
	@cat $(BACKUP_FOLDER)/backup_db.sql | docker exec -i postgres_transcendence psql -U ${POSTGRES_USER}
	@echo "Install complete."

build:
	@echo "Building transcendence images..."
	@mkdir -p $(VOL_FOLDERS)  || true
	@docker compose -f docker-compose.yml build

up: build
	@echo "Starting transcendence containers..."
	@docker compose -f docker-compose.yml up -d

stop:
	@echo "Stopping transcendence containers..."
	@docker compose -f docker-compose.yml stop

down:
	@echo "Setting down transcendence containers..."
	@docker compose -f docker-compose.yml down

re: fclean up

clean_data:
	@echo "Removing local files $(VOL_FOLDERS)."
	@rm -rf $(VOL_FOLDERS) >/dev/null 2>&1 || true
	@echo "All volumes have been removed."

clean: down
	@echo "Removing all transcendence containers, images, volumes and networks..."
	@docker rm -f $(CONTAINERS) >/dev/null 2>&1 || true
	@docker rmi -f $(IMAGES) >/dev/null 2>&1 || true
	@docker volume rm -f $(VOLUMES) >/dev/null 2>&1 || true
	@docker network rm -f $(NETWORK) >/dev/null 2>&1 || true
	@echo "All containers, images, volumes and networks have been removed."

prune:
	@echo "Pruning the system."
	@docker system prune -f >/dev/null 2>&1 || true
	@echo "Pruned the system."

fclean: clean clean_data prune

.PHONY:
	all backup install build up stop down re clean_data clean prune fclean