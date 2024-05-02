## Description

This repository contains an implementation of a URL shortener service built with NestJS, utilizing Knex.js as the query builder, PostgreSQL as the database management system, and Docker for containerization. The URL shortener service allows users to generate short URLs for long web addresses, making them easier to share and manage.

## Features
URL Shortening: Convert long URLs into shorter, more manageable links.
Link Management: View, update, and delete shortened URLs as needed.
Statistics: Track basic statistics such as click counts and last accessed timestamp for each shortened URL.

## Technologies Used
NestJS: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
Knex.js: A SQL query builder for Node.js, designed to be flexible, portable, and fun to use.
PostgreSQL: An open-source relational database management system known for its reliability, robustness, and performance.
Docker: A platform for developing, shipping, and running applications in containers.

## Docker
For containerization using Docker, you can utilize the following command:

`docker:compose-up`: Start the Docker containers defined in the docker-compose.yml file.
```bash
$ npm run docker:compose-up
```
This command orchestrates the setup defined in the docker-compose.yml file using docker-compose. It's a convenient way to launch your application within Docker containers.

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

## Knex Commands
To manage database migrations with Knex.js, you can use the following commands:

`knex:migrate-latest`: Run the latest database migrations.
```bash
$ npm run knex:migrate-latest
```

`knex:migrate-rollback`: Rollback the last batch of database migrations.
```bash
$ npm run knex:migrate-rollback
```
`knex:create-migration`: Create a new database migration file.
```bash
$ npm run knex:create-migration [migration_name]
```
Replace [migration_name] with a descriptive name for your migration.
These commands allow you to easily manage your database schema changes and keep your application's database structure up-to-date.

## Run E2E Tests

```bash
$ npm run test:e2e
```