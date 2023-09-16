#!/bin/bash

set -eu -o pipefail

docker compose -f <(node docker-compose.yml.js dev) up --build
