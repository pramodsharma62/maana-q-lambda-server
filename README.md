# Q-ready microservice for NodeJS with support for MongoDB (incl. Azure CosmosDB)

This is a Maana Q-compatible project template supporting modern JavaScript (ES2019) and community best practices and technologies, including ESLint, Prettier, Docker, GraphQL, and [Mongoose](https://mongoosejs.com/).

## Getting started

A _bare bones_ sample, **Foo**, has been provided that acts as a guide for where you should fill in your own schema, models, and resolvers.

- update `package.json` to reflect your information
- update `docker-compose-prod.yml` to reflect your docker image name
- modify the sample as appropriate

## Building and Running it:

- `yarn install` to get dependencies
- Use `docker-compose up` to start mongodb.
- Use `yarn dev` to start the server in Developer mode (hot reload).
- Use `yarn serve` to run the server in Production mode.

## Dependencies:

- Apollo Server
- Express
- Mongoose
- Nodemon
- Docker
- Docker-Compose
- ESLint
- Prettier

## Mongoose Schema

Under `src/db`, create one model file per file, then ensure they are included in the `index.js`. A small sample has been provided for you to modify.

## GraphQL Schema

Add your factored GraphQL schema and resolvers within sub-folders of `src/graphql`. They will be merged together for ApolloServer.

## Resolver Context

Your resolvers will receive, as part of the standard GraphQL `Context`, the following additional data:

- your Mongoose models
- the database object
- all of your other resolvers (allowing resolvers to call each other internally)

## Sample

A minimal example has been provided to get you started with the template. It includes a basic type, Foo, with two properties: _name_ (a string) and _bar_ (a number). There are two mutations: _create_ and _delete_, and two queries: _foo_ (get by name) and _totalBar_, which fetches all the _Foo_ instances and sums their _bar_ properties.

Replace `db/Foo.js` with your own database schema and include it in `db/index.js`.

Replace `graphql/foo` with your own GraphQL schema and JavaScript resolvers.

## Deployment

The template includes a Dockerfile and two docker-compose files (development and production) and can be deployed like any other service.

## Using Azure Cosmos DB

Follow the instructions of the [official Microsoft documentation](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb-mongoose).
