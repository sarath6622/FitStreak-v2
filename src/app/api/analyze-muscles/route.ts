import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getUserWorkoutHistory } from "@/services/workoutService";
import { log } from "console";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Define the structure for the data we'll send to the AI
interface ProcessedHistory {
  muscleGroup: string;
  lastTrained: string;
  daysAgo: number;
  totalVolume: number;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const rawHistory = await getUserWorkoutHistory(userId, 10);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const majorMuscleGroups = ["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Abs", "Calves", "Glutes"];

    // Process raw history to get the most recent workout for each muscle group
    const processedHistory: { [key: string]: ProcessedHistory } = {};

    majorMuscleGroups.forEach(group => {
        processedHistory[group] = {
            muscleGroup: group,
            lastTrained: "Never",
            daysAgo: 7,
            totalVolume: 0,
        };
    });

    // Populate data for trained muscle groups
    rawHistory.forEach(exercise => {
      const { date, muscleGroup, repsPerSet, weight } = exercise;

      if (majorMuscleGroups.includes(muscleGroup) && date) {
        const workoutDate = new Date(date);
        workoutDate.setHours(0, 0, 0, 0);
        const daysAgo = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate total volume
        const totalVolume = repsPerSet.reduce((sum, reps, i) => sum + reps * (weight[i] || 0), 0);
        
        // Update history if this is the most recent workout for the muscle group
        if (daysAgo < processedHistory[muscleGroup].daysAgo) {
          processedHistory[muscleGroup] = {
            muscleGroup,
            lastTrained: date,
            daysAgo: Math.min(daysAgo, 7), // Cap daysAgo at 7
            totalVolume,
          };
        }
      }
    });

    // Convert the processed object to an array for the AI prompt
    const finalHistoryForAI = Object.values(processedHistory);
    const historyJson = JSON.stringify(finalHistoryForAI, null, 2);

    const prompt = `
      You are a virtual fitness coach. Analyze the following workout history to recommend undertrained muscle groups.
      History contains a list of muscle groups, their last trained date, total days since training (max 7), and total volume.
      These are the major muscle groups : ["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Abs", "Calves", "Glutes"]
      Workout history:
      ${historyJson}

      Instructions:
      1. Identify muscle groups that have been trained more than 3 days ago.
      2. For each identified muscle group, evaluate its 'intensity' based on 'totalVolume'.
         - 'low' = totalVolume < 500
         - 'medium' = 500 <= totalVolume < 1500
         - 'high' = totalVolume >= 1500
      3. Return ONLY a JSON array of these undertrained muscle groups.
      4. The response format MUST be:
         [
           {
             "muscleGroup": string,
             "lastTrained": string,
             "daysAgo": number,
             "intensity": "low" | "medium" | "high"
           },
           ...
         ]
      5. Do NOT include any text, explanations, or greetings outside the JSON array.
    `;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });
    
    const summary = completion.choices[0].message.content;
    console.log("AI Summary:", summary);

    return NextResponse.json({ summary: JSON.parse(summary!) });
  } catch (error) {
    console.error("Error in /api/analyze-muscles:", error);
    return NextResponse.json({ error: "Failed to analyze muscle groups" }, { status: 500 });
  }
}