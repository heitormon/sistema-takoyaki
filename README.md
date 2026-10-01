## Sistema Takoyaki

Sistema de gerenciamento de pedidos para operação de Takoyaki, com telas de
painel, caixa e entrega em tempo real.


## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Running with Docker

### Prerequisites

- Docker Engine or Docker Desktop installed and running.
- Docker Compose v2 (`docker compose`).
- A `data` directory in the project. It stores `data.json` outside the
  container.

Create the data directory before starting:

```bash
mkdir -p data
```

The synchronization interval is configured with
`DATA_SYNC_INTERVAL_SECONDS`. The default is `60` seconds.

When running with Docker, set `PUBLIC_HOST` to the computer's Wi-Fi IP if you
want the startup log to print URLs accessible by other devices on the network:

```bash
PUBLIC_HOST=192.168.18.14 docker compose up -d --build
```

### Local build with Docker Compose

This option builds the image from the current project files. Use it when
developing or when you want to run the current local code.

1. From the project root, create the data directory:

   ```bash
   mkdir -p data
   ```

2. Build and start the application:

   ```bash
   DATA_SYNC_INTERVAL_SECONDS=10 docker compose up -d --build --force-recreate
   ```

3. Follow the application logs:

   ```bash
   docker compose logs -f takoyaki
   ```

4. Open the application at [http://localhost:3000/painel](http://localhost:3000/painel).

5. Stop the application while preserving the data directory:

   ```bash
   docker compose down
   ```

The Compose configuration mounts `./data` to `/app/data`, so the orders are
available at `data/data.json` on the host.

### Local development with automatic reload

For development, use the development Compose file. It mounts the project into
the container and runs NestJS in watch mode, so source changes are reloaded
without rebuilding the image.

```bash
DATA_SYNC_INTERVAL_SECONDS=60 docker compose -f docker-compose.dev.yml up --build
```

Stop it with `Ctrl+C`, or run:

```bash
docker compose -f docker-compose.dev.yml down
```

This mode is intended for local development. Use the regular Compose file or
the published image for a production-like deployment.

### Run the published image

Use this option to run a released image from Docker Hub without building the
project locally.

1. From the project root, create the data directory:

   ```bash
   mkdir -p data
   ```

2. Download the published image:

   ```bash
   docker pull heitormon/takoyaki:v4.0.1
   ```

3. Start the container with a 10-second synchronization interval:

   ```bash
   docker run -d \
     --name takoyaki \
     --restart unless-stopped \
     -p 3000:3000 \
     -e DATA_SYNC_INTERVAL_SECONDS=10 \
     -v "$(pwd)/data:/app/data" \
     heitormon/takoyaki:v4.0.1
   ```

4. Follow the application logs:

   ```bash
   docker logs -f takoyaki
   ```

5. Stop and remove the container when needed:

   ```bash
   docker stop takoyaki
   docker rm takoyaki
   ```

Open [http://localhost:3000/painel](http://localhost:3000/painel). The order
file remains available at `data/data.json` on the host.

When a GitHub Release is published, the workflow in
`.github/workflows/publish.yaml` builds and publishes the image
`heitormon/takoyaki` to Docker Hub. Configure the repository secrets
`DOCKER_USERNAME` and `DOCKER_PASSWORD` before publishing a release.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
