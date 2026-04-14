# AI Integration — VoltNexus EV Enterprise Ecosystem

## Overview

VoltNexus integrates **Google Gemini** (via Spring AI) as its primary AI engine. Rather than statistical ML models (TensorFlow/YOLO), the system leverages a **LLM-centric architecture** using generative AI for:

1. **Sales Demand Forecasting** — Predict 30-day vehicle sales per variant
2. **Production Planning** — AI-generated manufacturing plans with approval workflow
3. **EV Business Chatbot** — Context-aware assistant for sales and customer queries
4. **Analytics Dashboard** — AI-powered sales and inventory intelligence

Additionally, the **Reporting Service** contains `GeminiForecastingService` — a secondary forecasting engine isolated within the analytics domain.

---

## AI Technology Stack

| Component | Technology | Version |
|---|---|---|
| LLM Provider | Google Gemini (Generative AI) | API-based |
| AI Framework | Spring AI | 1.1.2 |
| AI Model Config | `spring-ai-starter-model-google-genai` | 1.1.2 |
| Vector Store | Spring AI Vector Store | 1.1.2 (Assumed integration) |
| Statistical Modeling | Apache Commons Math3 | 3.6.1 |
| HTTP Client | Spring WebClient / RestClient | Built-in |

> **Note:** The original task description referenced TensorFlow, OpenCV, and YOLO. The actual codebase implements AI through **Google Gemini LLM** via Spring AI — a more modern, API-first approach than traditional computer vision models. No TensorFlow or YOLO code was found in the repository.

---

## AI Service Architecture

```
External Client
     │
     ▼ POST /ai/chat/ask (Rate Limited)
     │ GET  /ai/forecast/{variantId}
     │ POST /ai/production-plan/generate
     │ GET  /ai/analytics/dashboard
     │
API Gateway (Rate Limit filter on /ai/**)
     │
     ▼
┌──────────────────────────────────┐
│         AI Service               │
│         (Port 8500)              │
│                                  │
│  ┌─────────────────────────────┐ │
│  │     GeminiAIService          │ │
│  │   ChatClient (Spring AI)     │ │
│  │   → Google Gemini API        │ │
│  └─────────────────────────────┘ │
│                                  │
│  ┌─────────────────────────────┐ │
│  │   DemandForecastService      │ │
│  │   (Batch & Advanced)         │ │
│  └─────────────────────────────┘ │
│                                  │
│  Data Clients (RestClient)        │
│  ├─ SalesServiceClient           │
│  ├─ InventoryServiceClient       │
│  ├─ VehicleServiceClient         │
│  └─ DealerServiceClient          │
└──────────────────────────────────┘
     │               │
     ▼               ▼
Sales Service   Inventory Service
(Sales History) (Stock Levels)
```

---

## AI Features: Detailed Breakdown

### 1. Sales Demand Forecasting

**Endpoint:** `GET /ai/forecast/{variantId}`

**Data Pipeline:**
```
1. Receive variant ID
2. Fetch 6-month sales history from Sales Service:
   GET /api/sales/history/{variantId}
3. Fetch current inventory from Inventory Service:
   GET /api/inventory/{variantId}
4. Build contextual LLM prompt (Java 21 Text Blocks):
   - Current date
   - Sales history data
   - Current stock levels
5. Submit to Google Gemini via ChatClient
6. Parse JSON response
7. Return forecast to caller
```

**Prompt Template:**
```
You are an expert standard for EV (Electric Vehicle) sales forecasting.
Analyze the following data and predict sales for the next 30 days.

Context:
- Variant ID: {variantId}
- Current Date: {today}

Data:
- Recent Sales History: {salesHistoryData}
- Current Inventory: {inventoryData}

Instructions:
1. Analyze the trend from sales history.
2. Consider the current inventory level.
3. Provide a sales forecast for the next 30 days.
4. Explain your reasoning briefly.
5. Output MUST be strictly in JSON format.

JSON Structure:
{
  "prediction": <number>,
  "confidence_score": <number between 0.0 and 1.0>,
  "reasoning": "<string>"
}
```

**Output:**
```json
{
  "prediction": 45,
  "confidence_score": 0.87,
  "reasoning": "Based on a consistent upward trend over 6 months with accelerated growth in Q1 2026, combined with healthy inventory of 18 units, demand for the next 30 days is estimated at 45 units. Seasonal factors and recent promotions in the region support this projection."
}
```

**Error Handling:**
```json
{
  "prediction": 0,
  "confidence_score": 0.0,
  "reasoning": "Error generating forecast: <error message>"
}
```

---

### 2. Batch / Advanced Demand Forecast (`DemandForecastService`)

Used internally or triggered by the Reporting Service for bulk planning operations.

**Input Parameters:**
- `variantId` (Long) — Vehicle variant identifier
- `variantName` (String) — Human-readable name for context
- `modelName` (String) — Parent model name
- `salesHistory` (List\<SalesHistory\>) — Historical records from DB
- `inventorySnapshots` (List\<InventorySnapshot\>) — Point-in-time stock data
- `daysToForecast` (int) — Forecast horizon
- `region` (String) — Geographic market segment

**AI Prompt:**
```
Analyze the following sales history and inventory to predict demand.
Variant: {name} ({id})
Model: {model}
Region: {region}
History Records: {count}
Inventory Snapshots: {count}

Predict sales for next {days} days.
Reply in JSON: { "predictedDemand": int, "confidenceScore": double, "trend": "string" }
```

**Output: `ForecastResult`**
```java
@Builder
class ForecastResult {
    int predictedDemand;
    double confidenceScore;
    String trend;  // "INCREASING", "STABLE", "DECLINING"
}
```

---

### 3. EV Business Chatbot

**Endpoint:** `POST /ai/chat/ask`

**Auth:** Public (rate-limited by Bucket4j at Gateway)

**Request:**
```json
{
  "query": "What is the best EV for a family with a budget of 2 billion VND?"
}
```

**Response:**
```json
{
  "response": "Based on VoltNexus's current catalog, the VoltFamily X with 450km range and 7-seat capacity..."
}
```

**Implementation:** `ChatController` → `GeminiAIService.chatClient.prompt().user(query).call().content()`

**Rate Limiting:** `GuestRateLimitGatewayFilterFactory` applied at Gateway — prevents API cost overrun from unauthenticated users.

---

### 4. Production Planning

**Endpoint:** `POST /ai/production-plan/generate`

**Flow:**
```
1. EVM Staff submits planning request (period, targets)
2. AI Service generates plan using Gemini:
   - Analyzes sales forecasts per variant
   - Considers dealer allocation needs
   - Suggests production quantities by model/variant
3. Plan saved as DRAFT in ai_db (ProductionPlan entity)
4. Admin reviews and approves via PUT /ai/production-plan/{planId}/approve
5. Approved plan triggers procurement/scheduling (Assumed)
```

**Entities:**
- `ProductionPlan`: `id`, `plan_period`, `status` (DRAFT/APPROVED), `content` (JSON), `generated_by`, `approved_by`, `created_at`, `approved_at`

---

### 5. Analytics Dashboard

**Endpoint:** `GET /ai/analytics/dashboard`

Returns AI-aggregated analytics across:
- `SalesAnalytics` — Revenue, units sold, trends
- `InventoryAnalytics` — Stock levels, velocity, alerts
- `RegionalPerformance` — Sales by region/dealer
- `ForecastSummary` — Upcoming demand predictions

Data pulled from Inventory, Sales, and Dealer services via REST clients:
- `InventoryServiceClient`
- `SalesServiceClient`
- `DealerServiceClient`

---

### 6. Reporting Service AI Integration (`GeminiForecastingService`)

Isolated within the Reporting Service — used for generating PDF/data reports with AI commentary.

**Purpose:** Generate narrative summaries for inventory and sales reports  
**Technology:** Google Gemini via Spring AI (same dependency as AI Service)

---

## Kafka Integration for Analytics

`AnalyticsListener` in AI Service subscribes to Kafka topics:

```java
// services/ai-service/src/main/java/com/ev/ai_service/listener/AnalyticsListener.java
@KafkaListener(topics = "order.events")
void handleOrderEvent(AnalyticsEventDTO event) {
    // Update SalesHistory table for AI training data
    // Trigger analytics recalculation if threshold crossed
}
```

This keeps the AI Service's local dataset (`sales_history`, `inventory_snapshots`) up-to-date for accurate forecasting.

---

## Input / Output Reference

| Feature | Input | Output |
|---|---|---|
| Sales Forecast | `variantId` (String) | `{ prediction, confidence_score, reasoning }` |
| Batch Forecast | Sales history + inventory snapshots + metadata | `ForecastResult { predictedDemand, confidenceScore, trend }` |
| Chatbot | Free-form question text | Natural language AI response |
| Production Plan | Planning period + targets | Structured production plan JSON |
| Analytics Dashboard | None (fetches internally) | Multi-domain analytics DTO |

---

## Spring AI Configuration

```properties
# application.properties (ai-service)
spring.ai.google.genai.api-key=${GOOGLE_GEMINI_API_KEY}
spring.ai.google.genai.model=gemini-pro   # (Assumed based on spring-ai-bom 1.1.2)

# Sales + Inventory service URLs for data fetching
sales.service.url=${SALES_SERVICE_URL}
inventory.service.url=${INVENTORY_SERVICE_URL}
```

Spring AI's `ChatClient` is initialized from the auto-configured `ChatModel`:

```java
public GeminiAIService(ChatModel chatModel, RestClient.Builder builder) {
    this.chatClient = ChatClient.create(chatModel);
    this.restClientBuilder = builder;
}
```

---

## AI System Strengths

| Aspect | Details |
|---|---|
| **Provider Agnosticism** | Spring AI abstraction allows swapping Gemini → OpenAI/Anthropic without code changes |
| **Contextual Grounding** | AI prompts include real-time operational data (not just static knowledge) |
| **Structured Output** | Prompts enforce JSON output format, enabling reliable downstream parsing |
| **Graceful Degradation** | All AI calls wrapped in try/catch with meaningful fallback responses |
| **Cost Control** | Rate limiting on chatbot, no AI calls in hot paths |
| **Audit Trail** | Forecast results logged to `forecast_logs` table for analysis |
