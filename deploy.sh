# Docker
docker build -t maana-q-lambda-server .
docker tag maana-q-lambda-server services.azurecr.io/maana-q-lambda-server:v1.2.2
docker push services.azurecr.io/maana-q-lambda-server:v1.2.2
docker-compose -f docker-compose-prod.yml up --no-start 

# Cleanup previous kubectl
kubectl delete deployment maana-q-lambda-server
# kubectl delete service maana-q-lambda-server-lb

# Convert compose into suitable K8 manifests
kompose convert -f docker-compose-prod.yml -o kompose

# Deploy
kubectl apply -f kompose
kubectl expose deployment maana-q-lambda-server --type=LoadBalancer --port=4000  --target-port=4000 --name=maana-q-lambda-server-lb

# Cleanup
rm kompose