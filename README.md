# first-microservice

<!-- Write a one-liner on your project here. -->

## Table of Contents

[Description](#Description)

[Prerequisites](#Prerequisites)

### Description

<!-- Further describe your project here. -->

### Prerequisites

Make sure to follow below instructions before you are trying to run the API on your machine.

## Local build of Docker Image

```shell
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
AWS_DEFAULT_REGION=us-east-1 aws codeartifact login --tool npm --repository selinarnd --domain selinarnd --domain-owner 020457103146
docker  build -t first-microservice --secret id=npmrc,src=$HOME/.npmrc --progress=plain --no-cache .
```


## Code Artifact 
Pre requirements is [AWS CLI should be installed and configured](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
```shell
AWS_DEFAULT_REGION=us-east-1 aws codeartifact login --tool npm --repository selinarnd --domain selinarnd --domain-owner 020457103146
```

#### NVM(Node Version Manager)

##### macOS and Linux users

Install NVM following the installation instruction in the following link:
https://github.com/creationix/nvm

##### Windows Users

Install NVM following the installation instruction in the following link:
https://github.com/coreybutler/nvm-windows

**Make sure to install and use a version of NodeJS bigger or equal to version 12.18 and smaller then version 13.**

**You will not be able to install the project dependencies if your version of NodeJS doesn't match the range specified above.**

#### Install Yarn

Make sure to have the latest stable version of Yarn globally installed on your machine.

Jump into the following link for installation instructions:
https://yarnpkg.com/en/docs/install

#### Docker

Visit the following link and follow the installation instructions to make sure you have a working installation
of Docker on your system:
https://www.docker.com/get-started

### Environment Setup

#### Clone The Project

Though it might be obvious, clone this project by typing `git clone https://github.com/selina-dev/first-microservice.git` in your terminal.

A new directory named `first-microservice` will be created with the project contents'.

Before we continue, `cd` into `first-microservice`.

#### Install Project Dependencies.

Type `yarn install` in your terminal of choice to install all project dependencies, then wait for the installation to complete.

#### Run External Dependencies With Docker Compose

Now we need to have an instance of the following services:

- Latest PostgreSQL LTS version
- PostgreSQL admin for easy data access



Luckily, all of these were already been configured in the `docker-compose.yml` file at the project root directory.

To run above services type `docker-compose up -d` in the terminal. If everything goes well you should be promted with something like the following:

```bash
Creating network "first-microservice_default" with the default driver
Creating first-microservice_postgres_1      ... done
Creating first-microservice_pgadmin_1 ... done



```

#### Prepare Yourself a `development.env` File

Open `example.env` to see the full list of environment variables the server uses for its internal configurations(example printed below).

```
NODE_ENV=
PORT=

TYPEORM_CONNECTION=
TYPEORM_HOST=
TYPEORM_PORT=
TYPEORM_DATABASE=
TYPEORM_USERNAME=
TYPEORM_PASSWORD=






```

Running the server with `yarn start` will preload environment variables from a `development.env` file at the project root.

This file is intentionally ignored by git to avoid exposing sensitive data as part of our code base. So let's create an empty `development.env` file.

Dealing with environment variables is not that fun. True. That's why we use smart defaults for project settings and a `development.example.env` scaffold file.

Copy the contents of `development.example.env` into our newly created `development.env` file.

Our `development.env` file should now look somewhat like this:

```
NODE_ENV=development
PORT=3000

TYPEORM_CONNECTION=postgres
TYPEORM_HOST=localhost
TYPEORM_PORT=5432
TYPEORM_DATABASE=first-microservice
TYPEORM_USERNAME=postgres
TYPEORM_PASSWORD=admin
TYPEORM_SYNCHRONIZE=true
TYPEORM_LOGGING=true
TYPEORM_ENTITIES=src/database/entities/**
TYPEORM_MIGRATIONS=src/database/migrations/**




```

Nothing here is sensitive. The information provided in the scaffold file references the services we previously ran with Docker Compose. For some services we have not yet created mock implementations so ask your teammates for the missing credentials. Be sure to ask for credentials of our test environment.

#### Run The Migration Scripts

Right now, our PostgreSQL database is empty. We need to initialize our PostgreSQL schema and feed it with data. We can do that by running the database migration scripts.

These database migrations demonstrate(and execute) data migrations from a clone of the company's Neo4j data store to a new PostgreSQL server.

Type the following in the terminal to run the migration scripts:
`yarn migration:run`

Upon successful migration, the log would notify you that the last migration script has been executed successfully:

```bash
Migration UpdatedAtTrigger1547570135389 has been executed successfully.
query: COMMIT
Done in 5.43s.
```


#### Run The Server

The only thing left now is to run our server.

`yarn start` will run a local server listening on the port provided in `development.env`(default to port 3000 when a value for `PORT` was not provided).

It might take a little for the server to bootstrap, so be patient. You'll know the server is listening for incoming requests when a similar line will appear in the console:

`[Nest] 6024 - 1/17/2019, 7:56:23 PM [NestApplication] Nest application successfully started +5257ms`
