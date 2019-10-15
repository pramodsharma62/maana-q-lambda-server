# Maana Q Lambda Server

## MongoDB

```
docker-compose up
```

## Build and Deploy

```
npm i
npm run docker-build
gql mdeploy
```

- `Private Docker Registry`
- name: `maana-q-lambda-server`
- Dockerfile: `./`
- Container registry: `services.azurecr.io`
- Exposing port: `4000`

## Using Azure Cosmos DB

Follow the instructions of the [official Microsoft documentation](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb-mongoose).
