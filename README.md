# ✨ Prompt Analysis & Evaluation

A comprehensive tool for recording, managing, and analyzing your AI prompt engineering efforts. Get professional feedback and improve your skills by tracking your prompt history.

## 🚀 Key Features

- **Prompt Recording**: Automatically log prompts from your terminal, apps, or AI agents.
- **AI Analysis**: Get detailed evaluations from Gemini or ChatGPT.
- **Data Insights**: Access raw data via API for custom analysis.
- **API Management**: Generate and manage personal API keys.

## 🧞 Commands

All commands are run from the root of the project:

| Command | Action |
| :--- | :--- |
| `npm install` | Installs dependencies |
| `npm run dev` | Starts local dev server at `localhost:4321` |
| `npm run build` | Build your production site to `./dist/` |
| `npm run preview` | Preview your build locally |

## 📊 Prompt Analysis Guide

You can use your recorded prompt history to get professional feedback from **Gemini** or **ChatGPT**.

### 1. Access Your Raw Data
Open the data table in your browser using your API key:
`http://localhost:4321/prompt-samples?token=YOUR_API_KEY`

### 2. Analyze with AI
Copy the data from the table and paste it into an AI chat with the following instruction:

> You are an AI Data Analysis & Prompt Engineering Expert. Your role is to analyze text data from AI prompt histories and provide a detailed evaluation, scoring, and actionable advice.
> 
> Review all prompts carefully and assign a score (0-100) for: **Clarity, Specificity, Creativity, Efficiency, Context Use, Communication Style,** and **Consistency**.

---

## 🔌 API Documentation

### 1. Authentication
All API requests must include your **Personal API Key** in the `Authorization` header:
`Authorization: Bearer YOUR_API_KEY`

### 2. Record a Prompt
**Endpoint:** `POST /api/promt`

**Request Body:**
```json
{
  "prompt": "Tell me a joke about robots",
  "source": "CLI",
  "model": "gpt-4",
  "temperature": 0.7
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4321/api/promt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "prompt": "Hello from curl!",
    "source": "Terminal"
  }'
```

---

## � Project Structure

- `src/pages/`: Route definitions (Astro).
- `src/components/`: React/Astro UI components.
- `src/lib/`: Core logic and AI analysis utilities.
- `public/`: Static assets.

Check out the [Astro Documentation](https://docs.astro.build) for more info on the underlying framework.
