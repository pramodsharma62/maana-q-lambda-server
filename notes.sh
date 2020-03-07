

az acr repository list --name services --output table

az acr login --name services --resource-group=CTO

If you have problems here with ACR not found:
services
kubectl create secret docker-registry services --docker-server=services.azurecr.io --docker-username=services --docker-password=DaBhkCBalRkyvbXC3fg7dMl4BNv+hGSB
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "services"}]}'
kubectl get serviceaccount -o yaml
