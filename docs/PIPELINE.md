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