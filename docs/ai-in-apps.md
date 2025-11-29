# Hands-On Exercises: AI Integration with Next.js

These exercises progressively introduce AI/LLM integration into the reference project. Each exercise includes a sample prompt to help you get started.

---

## Exercise 1: Your First LLM Interaction

**Objective:** Make your first API call to an LLM and display the response.

**Task:** Create a simple script that sends a prompt to the LLM API and logs the response.

**File to create:** `scripts/hello-ai.ts`

```typescript
// Use the OpenAI or Anthropic SDK to send a simple message
// Log the response to the console
```

**Sample Prompt:**
```
You are a helpful assistant. Say hello and introduce yourself in one sentence.
```

**Success Criteria:**
- Script runs without errors
- Response is logged to the console

---

## Exercise 2: Environment Setup and API Key Management

**Objective:** Properly configure API keys and handle missing credentials.

**Task:**
1. Add your API key to `.env.local`
2. Create a utility function that safely retrieves the API key
3. Throw a meaningful error if the key is missing

**File to create:** `src/lib/ai/config.ts`

**Sample Prompt:**
```
Confirm this connection works by responding with only: "Connection successful"
```

**Success Criteria:**
- API key is not hardcoded
- Clear error message when key is missing
- Connection test passes

---

## Exercise 3: Create an AI-Powered API Endpoint

**Objective:** Build a Next.js API route that forwards requests to an LLM.

**Task:** Create an endpoint at `/api/ai/chat` that:
1. Accepts a POST request with a `message` field
2. Sends the message to the LLM
3. Returns the AI response as JSON

**File to create:** `src/app/api/ai/chat/route.ts`

**Sample Prompt (for testing your endpoint):**
```
What are three benefits of using TypeScript?
```

**Success Criteria:**
- Endpoint responds to POST requests
- Returns proper JSON response
- Handles errors gracefully

---

## Exercise 4: Product Description Generator

**Objective:** Use AI to generate marketing descriptions for products.

**Task:** Create an endpoint `/api/ai/product-description` that:
1. Accepts a product name and price
2. Generates a compelling product description
3. Returns the generated text

**File to create:** `src/app/api/ai/product-description/route.ts`

**Sample Prompt (to send to the LLM):**
```
Generate a short, engaging product description (2-3 sentences) for the following product:

Name: {{productName}}
Price: ${{price}}

The description should highlight value and appeal to customers.
```

**Success Criteria:**
- Accepts product details via POST
- Returns creative, contextual descriptions
- Different products yield different descriptions

---

## Exercise 5: System Prompts and Role Definition

**Objective:** Learn to use system prompts to control AI behavior.

**Task:** Create a product assistant endpoint `/api/ai/assistant` that:
1. Uses a system prompt to define the assistant's role
2. Only answers questions about products in our catalog
3. Politely declines off-topic questions

**File to create:** `src/app/api/ai/assistant/route.ts`

**System Prompt:**
```
You are a helpful shopping assistant for an online store. You help customers with questions about products, pricing, and recommendations.

Rules:
- Only discuss products, shopping, and related topics
- If asked about unrelated topics, politely redirect to shopping
- Be friendly and concise
- If you don't know something, say so honestly
```

**Success Criteria:**
- Assistant stays in character
- Off-topic questions are redirected
- Responses are helpful and relevant

---

## Exercise 6: Integrating Database Data with AI

**Objective:** Combine real product data from the database with AI responses.

**Task:** Create an endpoint `/api/ai/product-info/[id]` that:
1. Fetches the product from the database
2. Sends product details to the LLM
3. Returns an AI-enhanced product summary

**File to create:** `src/app/api/ai/product-info/[id]/route.ts`

**Sample Prompt (to send to the LLM):**
```
Based on this product information, provide a helpful summary for a customer:

Product: {{product.name}}
Price: ${{product.price}}
Category: {{section.name}}

Include: what the product is, who it's for, and why it's a good choice.
```

**Success Criteria:**
- Fetches real product data from SQLite
- AI response incorporates actual product details
- Returns 404 for non-existent products

---

## Exercise 7: Smart Product Recommendations

**Objective:** Build an AI-powered recommendation system.

**Task:** Create an endpoint `/api/ai/recommend` that:
1. Accepts a user's preferences or current product ID
2. Fetches available products from the database
3. Uses AI to recommend the best matches

**File to create:** `src/app/api/ai/recommend/route.ts`

**Sample Prompt (to send to the LLM):**
```
You are a product recommendation engine. Given the user's interest and our available products, suggest the best matches.

User's interest: {{userInterest}}

Available products:
{{#products}}
- {{name}} (${{price}}) - Category: {{sectionName}}
{{/products}}

Recommend 1-3 products with a brief explanation for each.
```

**Success Criteria:**
- Recommendations are based on actual database products
- AI explains why each product is recommended
- Handles empty or invalid preferences gracefully

---

## Exercise 8: Natural Language Product Search

**Objective:** Allow users to search products using natural language.

**Task:** Create an endpoint `/api/ai/search` that:
1. Accepts a natural language query
2. Uses AI to interpret the intent
3. Returns matching products from the database

**File to create:** `src/app/api/ai/search/route.ts`

**Sample Queries to Support:**
```
"I need something to read about programming"
"What's the cheapest electronic device?"
"Show me everything under $50"
```

**Sample Prompt (to send to the LLM):**
```
Analyze this search query and extract the search criteria as JSON.

Query: "{{userQuery}}"

Available categories: Electronics, Books, Clothing

Return JSON with this structure:
{
  "category": "category name or null",
  "maxPrice": number or null,
  "keywords": ["relevant", "keywords"]
}
```

**Success Criteria:**
- Natural language queries are interpreted correctly
- Returns real products matching the intent
- Handles ambiguous queries gracefully

---

## Exercise 9: Structured Output with Validation

**Objective:** Ensure AI responses conform to expected schemas using Zod.

**Task:** Create an endpoint `/api/ai/analyze-review` that:
1. Accepts a product review text
2. Uses AI to analyze sentiment and extract key points
3. Validates the AI response against a Zod schema

**File to create:** `src/app/api/ai/analyze-review/route.ts`

**Zod Schema to use:**
```typescript
const ReviewAnalysisSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  score: z.number().min(1).max(5),
  keyPoints: z.array(z.string()).max(3),
  recommendation: z.boolean()
});
```

**Sample Prompt (to send to the LLM):**
```
Analyze this product review and return a JSON object with:
- sentiment: "positive", "neutral", or "negative"
- score: 1-5 rating based on the review
- keyPoints: up to 3 main points from the review
- recommendation: true if the reviewer would recommend, false otherwise

Review: "{{reviewText}}"

Return only valid JSON, no additional text.
```

**Success Criteria:**
- AI responses are validated with Zod
- Invalid responses are handled with retry or error
- Type-safe response throughout the code

---

## Exercise 10: Multi-Step Shopping Assistant Agent

**Objective:** Build an AI agent that can perform multiple steps to help users.

**Task:** Create an endpoint `/api/ai/shopping-agent` that:
1. Understands complex user requests
2. Decides which actions to take (search, recommend, describe)
3. Executes multiple steps and compiles the response

**File to create:** `src/app/api/ai/shopping-agent/route.ts`

**Sample User Requests:**
```
"Find me a book about coding and tell me why I should buy it"
"What's the best product in each category?"
"Compare the laptop and smartphone prices"
```

**System Prompt:**
```
You are a shopping assistant agent. You can perform these actions:
1. SEARCH: Find products by criteria
2. DESCRIBE: Get detailed description of a product
3. RECOMMEND: Suggest products based on preferences
4. COMPARE: Compare two or more products

For each user request:
1. Determine which actions are needed
2. Specify the parameters for each action
3. Return your plan as JSON:

{
  "actions": [
    {"type": "SEARCH", "params": {"query": "..."}},
    {"type": "DESCRIBE", "params": {"productId": 1}}
  ]
}
```

**Success Criteria:**
- Agent correctly interprets complex requests
- Multiple actions are executed in sequence
- Final response combines all gathered information
- Handles failures in individual steps gracefully

---

## Tips for All Exercises

1. **Error Handling:** Always wrap LLM calls in try-catch blocks
2. **Timeouts:** Set reasonable timeouts for API calls
3. **Rate Limiting:** Be mindful of API rate limits during development
4. **Logging:** Use the project's logger (`src/lib/utils/logger.ts`) for debugging
5. **Testing:** Test with various inputs, including edge cases

## Useful Commands

```bash
# Run the development server
pnpm dev

# Run tests
pnpm test

# Check types
pnpm typecheck

# Lint code
pnpm lint
```

## Sample API Client Setup (OpenAI)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ],
});
```

## Sample API Client Setup (Anthropic)

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
});
```
