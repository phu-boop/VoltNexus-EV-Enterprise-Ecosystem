docker run --rm --network voltnexus-ev-enterprise-ecosystem_app-network \
  -v $(pwd)/tests/performance:/src \
  -i grafana/k6 run /src/load-test.js
