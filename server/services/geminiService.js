import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

export const IntentCapsuleSchemaZod = z.object({
  userPrompt: z.string(),
  maxBudget: z.number().positive(),
  allowedCategories: z.array(z.string()).nonempty(),
  allowedCurrency: z.string().default('INR'),
  requiresApprovalAbove: z.number().positive(),
  maxTransactions: z.number().int().positive().default(1)
});

export const generateIntentCapsule = async (userPromptText) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `You are Razorpay IntentGuard's AI Policy Generator.
Convert the following user shopping intent into a strict security JSON policy for an autonomous AI shopping agent.

User Intent: "${userPromptText}"

Return ONLY a valid, raw JSON object (no markdown, no backticks, no explanatory text) with this exact schema:
{
  "userPrompt": "${userPromptText}",
  "maxBudget": <number in INR e.g. 3000>,
  "allowedCategories": [<array of lowercased relevant item/service categories e.g. ["footwear", "running shoes", "sports"]>],
  "allowedCurrency": "INR",
  "requiresApprovalAbove": <number in INR, typically 60-80% of maxBudget e.g. 2000>,
  "maxTransactions": 1
}

Rule Guidelines:
1. Extract numerical budget limits accurately from INR / ₹ symbols or plain numbers. Default to 5000 if unspecified.
2. set requiresApprovalAbove to 70% of maxBudget.
3. allowedCategories must include relevant primary and sub-categories (e.g. for "running shoes", include ["running shoes", "footwear", "shoes", "sports apparel"]).
4. Keep maxTransactions at 1 by default.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Clean possible markdown backticks
      const cleanJsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);

      const validated = IntentCapsuleSchemaZod.parse({
        ...parsed,
        userPrompt: userPromptText
      });
      return { success: true, capsule: validated, source: 'gemini-flash' };
    } catch (err) {
      console.warn(`[Gemini Flash Warning] AI synthesis error (${err.message}). Falling back to deterministic intent parser.`);
    }
  }

  // Deterministic fallback generator for instant, guaranteed offline execution
  return parseIntentDeterministically(userPromptText);
};

function parseIntentDeterministically(userPromptText) {
  const lower = userPromptText.toLowerCase();

  // Extract budget
  const match = lower.match(/(?:under|max|below|upto|₹|rs\.?|inr)?\s*(\d[\d,]*)/i);
  let budget = 3000;
  if (match && match[1]) {
    const parsedNum = parseInt(match[1].replace(/,/g, ''), 10);
    if (!isNaN(parsedNum) && parsedNum > 0) {
      budget = parsedNum;
    }
  }

  // Categories extraction
  const categories = [];
  if (lower.includes('shoe') || lower.includes('running') || lower.includes('sneaker') || lower.includes('footwear')) {
    categories.push('footwear', 'running shoes', 'sports');
  } else if (lower.includes('flight') || lower.includes('air') || lower.includes('ticket') || lower.includes('travel')) {
    categories.push('travel', 'flights', 'tickets');
  } else if (lower.includes('phone') || lower.includes('mobile') || lower.includes('electronics') || lower.includes('gadget')) {
    categories.push('electronics', 'mobile phones', 'gadgets');
  } else if (lower.includes('book') || lower.includes('novel')) {
    categories.push('books', 'education', 'reading');
  } else if (lower.includes('food') || lower.includes('pizza') || lower.includes('meal')) {
    categories.push('food', 'restaurants', 'dining');
  } else {
    categories.push('general merchandise', 'retail');
  }

  const capsule = {
    userPrompt: userPromptText,
    maxBudget: budget,
    allowedCategories: Array.from(new Set(categories)),
    allowedCurrency: 'INR',
    requiresApprovalAbove: Math.round(budget * 0.7),
    maxTransactions: 1
  };

  return { success: true, capsule, source: 'deterministic-parser' };
}
