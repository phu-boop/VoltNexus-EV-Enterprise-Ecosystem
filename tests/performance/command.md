docker run --rm --network voltnexus-ev-enterprise-ecosystem_app-network \
  -v $(pwd)/tests/performance:/src \
  -i grafana/k6 run /src/load-test.js




// start kerbunets
AWS
ssh -i voltnexus-key.pem ubuntu@54.242.202.65
// GUI
minikube GUI
minikube start --memory=8192 --cpus=4


// performance
// hybrid 
docker run --rm \
  --add-host=host.docker.internal:host-gateway \
  --network voltnexus-ev-enterprise-ecosystem_app-network \
  -v $(pwd)/tests/performance:/src \
  grafana/k6 run /src/load-test.js
