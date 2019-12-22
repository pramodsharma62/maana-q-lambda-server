# Maana Q Lambda Server

# Hosts

## Q

### JavaScript

We use the node [VM2](https://github.com/patriksimek/vm2) package for running JavaScript within a sandbox.

Lambda code has access to the following modules:

- [request](https://github.com/request/request)
- [graphql-request](https://github.com/prisma-labs/graphql-request)
- [core-js](https://github.com/zloirock/core-js)
- [lodash](https://github.com/lodash/lodash)
- [moment](https://github.com/moment/moment)
- [uuid](https://github.com/kelektiv/node-uuid)
- [object-hash](github.com/puleos/object-hash)
- [js-graph-algorithms](https://github.com/chen0040/js-graph-algorithms)
- [mathjs](github.com/josdejong/mathjs)

`console.log` output from withihn a lambda function will be returned as a GraphQL `extension` response.

### Python

- macOS: `brew install python`

### Haskell

[ghcup](https://www.haskell.org/ghcup/)

`curl https://get-ghcup.haskell.org -sSf | sh`

### R

- macOS: `brew install r`

## AWS

## Google

# Build and Deploy

## MongoDB

```
docker-compose up
```

## Service

```
npm i
gql mdeploy
```

- `Private Docker Registry`
- name: `maana-q-lambda-server`
- Dockerfile: `./`
- Container registry: `services.azurecr.io`
- Exposing port: `4000`

# Using Azure Cosmos DB

Follow the instructions of the [official Microsoft documentation](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb-mongoose) to change the connection string (that's all there is to it).
