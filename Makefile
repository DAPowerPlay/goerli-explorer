.PHONY: help start build release

DEFAULT_GOAL: help

## Start development stack
start:
	@docker-compose up

## Build dev docker images
build:
	@docker-compose down
	- @docker volume rm lisinski-explorer_explorer-node-modules
	@docker-compose build

## Build dev docker images
release:
	@docker build -f docker/Dockerfile --build-arg NODE_ENV=production --tag nodefactory/lisinski-explorer:latest .

## Show help screen.
help:
	@echo "Please use \`make <target>' where <target> is one of\n\n"
	@awk '/^[a-zA-Z\-\_0-9]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "%-30s %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)
