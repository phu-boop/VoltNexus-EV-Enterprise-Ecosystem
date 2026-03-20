Developer push code
        ↓
GitHub
        ↓
GitHub Actions (CI/CD)
        ↓
Build Docker Image
        ↓
Push Image
        ↓
Deploy to Kubernetes (Minikube)
        ↓
Kubernetes start Backend Container
        ↓
Run Postman API Test (Newman)
        ↓
Generate HTML Report
        ↓
If fail → Create Jira Bug





| Thành phần           | Có | Thiếu |
| -------------------- | -- | ----- |
| Code build           | ✅  |       |
| Docker build         | ✅  |       |
| Kubernetes deploy    | ✅  |       |
| API test             | ✅  |       |
| Jira automation      | ✅  |       |
| Backend unit test    | ❌  |       |
| Frontend test        | ❌  |       |
| Static analysis      | ❌  |       |
| Security scan        | ❌  |       |
| Docker registry push | ❌  |       |
| E2E test             | ❌  |       |
