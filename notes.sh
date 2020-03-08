

az acr repository list --name services --output table

az acr login --name services --resource-group=CTO

If you have problems here with ACR not found:
services
kubectl create secret docker-registry services --docker-server=services.azurecr.io --docker-username=services --docker-password=DaBhkCBalRkyvbXC3fg7dMl4BNv+hGSB
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "services"}]}'
kubectl get serviceaccount -o yaml


   az ad sp create-for-rbac --name "myApp" --role contributor \
                            --scopes /subscriptions/c73d0ee9-3ec0-402e-b7eb-2d5a99e9f0f0/resourceGroups/maanaQ \
                            --sdk-auth

az acr repository show-tags -n services --repository maana-q-lambda-server
                            