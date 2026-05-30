import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Settings > Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint to parse the raw natural language workout log
app.post("/api/parse-workout", async (req, res) => {
  try {
    const { log } = req.body;

    if (!log || typeof log !== "string" || log.trim().length === 0) {
       res.status(400).json({ error: "Please provide a non-empty workout log string." });
       return;
    }

    const ai = getAiClient();

    const systemInstruction = `You are the backend engine for "Fit-RPG", a fitness JRPG.
Your job is to analyze a user's raw, natural language workout log, parse it, and categorize the workout session into our 4 game pillars:
1. weights (for free weights, barbell, dumbbell, general weightlifting)
2. machines (for isolation machines, pulley cables, Smith machine, cardio machines without free motion - e.g., if resistance machine like leg press)
3. cardio (for running, bicycling, swimming, jogging, rowing, elliptical)
4. bodyweight (for pushups, pullups, planks, sit-ups, yoga, gymnastics, general calisthenics)

You must map the workout description to a single JRPG stat gained:
- weights -> 'strength'
- machines -> 'defense'
- cardio -> 'agility'
- bodyweight -> 'hp'

Calculate 'xpGained' (integer from 10 to 100) and 'statAmount' (integer from 1 to 10) based on the effort, weight, set/rep count, or duration described:
- Light / Quick work: 10 - 25 XP, 1 - 3 stat points
- Moderate work: 30 - 60 XP, 4 - 7 stat points
- Intense / Long work: 65 - 100 XP, 8 - 10 stat points

Create 'flavorText', which must be a single, short, epic fantasy JRPG narrative sentence describing their exercise accomplishment in an awesome classic pixel RPG/D&D style. Emphasize physical power, steel, sweat, endurance, and magical aura.

Return EXACTLY a JSON structure matching the schema. Do not output anything other than of this schema.`;

    const prompt = `Translate this raw mortal workout log into a grand fantasy achievement:
"${log}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pillar: {
              type: Type.STRING,
              description: "Must be one of: 'weights', 'machines', 'cardio', or 'bodyweight'.",
            },
            xpGained: {
              type: Type.INTEGER,
              description: "An integer between 10 and 100 representing effort.",
            },
            statGained: {
              type: Type.STRING,
              description: "Must be one of: 'strength', 'defense', 'agility', or 'hp'.",
            },
            statAmount: {
              type: Type.INTEGER,
              description: "An integer between 1 and 10 representing status point reward.",
            },
            flavorText: {
              type: Type.STRING,
              description: "A short, epic fantasy JRPG narrative sentence describing their exercise accomplishment.",
            },
          },
          required: ["pillar", "xpGained", "statGained", "statAmount", "flavorText"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from the AI model.");
    }

    // Parse safety check
    const result = JSON.parse(text.trim());
    res.json(result);
  } catch (error: any) {
    console.error("Error parsing workout:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred during quest parsing."
    });
  }
});

// Configure Vite or Static files depending on NODE_ENV
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    // Import Vite dynamically
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fit-RPG Engine soundly awake on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
