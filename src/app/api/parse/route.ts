import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import OpenAI from 'openai';

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Transaction {
  date: string;
  desc: string;
  amount: number;
}

interface StatementDetails {
  name: string | null;
  address: string | null;
  date: string | null;
  startingBalance: number | null;
  endingBalance: number | null;
  transactions: Transaction[];
  reconciles: boolean | null;
  error?: string;
}

async function extractStatementDetails(text: string): Promise<StatementDetails> {
  const prompt = `
You are an expert financial assistant. From the following bank statement text, extract the account holder name, address, statement date, starting balance, ending balance, and all transactions.

Respond in **strict** JSON with this structure:

{
  "name": "string or null",
  "address": "string or null",
  "date": "string or null",
  "startingBalance": number or null,
  "endingBalance": number or null,
  "transactions": [
    {
      "date": "DD-MM-YYYY or similar",
      "description": "string",
      "moneyIn": number or null,
      "moneyOut": number or null
    }
  ]
}

Rules:
- Put credit amounts (money in) in 'moneyIn', and set 'moneyOut' to null or 0.
- Put debit amounts (money out) in 'moneyOut', and set 'moneyIn' to null or 0.
- Skip empty or ambiguous transactions.
- No additional text before or after the JSON.

--- BANK STATEMENT TEXT ---
${text.slice(0, 8000)}
---------------------------
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Empty LLM response");

    const parsed = JSON.parse(content);

    const { name, address, date, startingBalance, endingBalance, transactions: rawTransactions } = parsed;

    const transactions: Transaction[] = Array.isArray(rawTransactions)
      ? rawTransactions.flatMap((tx: any): Transaction[] => {
          if (
            typeof tx.date !== "string" ||
            typeof tx.description !== "string"
          ) return [];

          const moneyIn = typeof tx.moneyIn === "number" ? tx.moneyIn : 0;
          const moneyOut = typeof tx.moneyOut === "number" ? tx.moneyOut : 0;

          if (moneyIn > 0 && moneyOut > 0) return []; // ambiguous
          if (moneyIn < 0 || moneyOut < 0) return []; // invalid

          return [{
            date: tx.date.trim(),
            desc: tx.description.trim() || "No Description",
            amount: moneyIn > 0 ? moneyIn : -moneyOut,
          }];
        })
      : [];

    // Optional reconciliation check
    let reconciles: boolean | null = null;
    if (
      typeof startingBalance === "number" &&
      typeof endingBalance === "number"
    ) {
      const sumTx = transactions.reduce((acc, t) => acc + t.amount, 0);
      reconciles = parseFloat((startingBalance + sumTx).toFixed(2)) === parseFloat(endingBalance.toFixed(2));
    }

    return {
      name: name ?? null,
      address: address ?? null,
      date: date ?? null,
      startingBalance: typeof startingBalance === "number" ? startingBalance : null,
      endingBalance: typeof endingBalance === "number" ? endingBalance : null,
      transactions,
      reconciles,
    };
  } catch (error) {
    console.error("LLM Parsing Error:", error);
    return {
      error: "Failed to extract statement details",
      name: null,
      address: null,
      date: null,
      startingBalance: null,
      endingBalance: null,
      transactions: [],
      reconciles: null,
    };
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 500 });
    }

    const details = await extractStatementDetails(text);

    return NextResponse.json(details);
  } catch (err: any) {
    console.error("PDF Processing Error:", err);
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}
