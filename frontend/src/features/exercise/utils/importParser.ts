import type { Difficulty, ExerciseType } from "../types";

export interface ParsedQuestion {
  type: ExerciseType;
  questionText: string;
  points: number;
  explanation?: string;
  options?: { optionText: string; isCorrect: boolean; sortOrder: number }[];
  correctAnswers?: string[];
}

export interface ParsedImportData {
  title?: string;
  difficulty?: Difficulty;
  estimatedMinutes?: number;
  description?: string;
  questions: ParsedQuestion[];
}

export function parseQuickImportText(text: string): ParsedImportData {
  const result: ParsedImportData = {
    questions: [],
  };

  // Try parsing as JSON first
  try {
    const trimmed = text.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      const data = JSON.parse(trimmed);
      if (Array.isArray(data)) {
        return {
          questions: data.map((q: any) => parseJsonQuestion(q)),
        };
      } else if (data && typeof data === "object") {
        return {
          title: data.title || undefined,
          difficulty: data.difficulty || undefined,
          estimatedMinutes: data.estimatedMinutes ? Number(data.estimatedMinutes) : undefined,
          description: data.description || undefined,
          questions: Array.isArray(data.questions) 
            ? data.questions.map((q: any) => parseJsonQuestion(q))
            : [],
        };
      }
    }
  } catch (e) {
    // Not valid JSON, proceed to text parsing
  }

  // Text parser
  const lines = text.split(/\r?\n/);
  let currentMetadata = true;
  let questionBlocks: string[][] = [];
  let currentBlock: string[] = [];

  for (let line of lines) {
    const trimmedLine = line.trim();
    
    // Check if we hit the divider or the first question line
    if (
      trimmedLine === "---" || 
      /^\d+[\.\)]/.test(trimmedLine) || 
      (trimmedLine.toLowerCase().startsWith("q") && /^[qQ]\d+[\.\):]/.test(trimmedLine))
    ) {
      currentMetadata = false;
      if (trimmedLine === "---") {
        if (currentBlock.length > 0) {
          questionBlocks.push(currentBlock);
          currentBlock = [];
        }
        continue;
      }
    }

    if (currentMetadata) {
      // Parse metadata lines: "Key: Value"
      const match = trimmedLine.match(/^([a-zA-Z\s]+):\s*(.*)$/);
      if (match) {
        const key = match[1].trim().toLowerCase();
        const val = match[2].trim();
        if (key === "title") result.title = val;
        else if (key === "difficulty" || key === "level") {
          const upper = val.toUpperCase();
          if (upper === "BEGINNER" || upper === "INTERMEDIATE" || upper === "ADVANCED") {
            result.difficulty = upper as Difficulty;
          }
        } else if (key === "duration" || key === "time" || key === "estimatedminutes" || key === "minutes") {
          result.estimatedMinutes = parseInt(val) || 10;
        } else if (key === "description" || key === "desc") {
          result.description = val;
        }
      } else if (trimmedLine && !result.description) {
        // If it's a random line in metadata, append to description
        result.description = result.description ? result.description + "\n" + trimmedLine : trimmedLine;
      }
    } else {
      // It's a question line
      if (trimmedLine === "" && currentBlock.length > 0) {
        // Empty line separates question blocks unless they are separated by '---'
        questionBlocks.push(currentBlock);
        currentBlock = [];
      } else if (trimmedLine !== "") {
        const isNewQ = /^\d+[\.\)]/.test(trimmedLine) || (trimmedLine.toLowerCase().startsWith("q") && /^[qQ]\d+[\.\):]/.test(trimmedLine));
        if (isNewQ && currentBlock.length > 0) {
          questionBlocks.push(currentBlock);
          currentBlock = [];
        }
        currentBlock.push(trimmedLine);
      }
    }
  }

  if (currentBlock.length > 0) {
    questionBlocks.push(currentBlock);
  }

  // Parse each block into a ParsedQuestion
  for (const block of questionBlocks) {
    const question = parseQuestionBlock(block);
    if (question) {
      result.questions.push(question);
    }
  }

  return result;
}

function parseJsonQuestion(q: any): ParsedQuestion {
  const type: ExerciseType = q.type === "FILL_IN_BLANK" ? "FILL_IN_BLANK" : "MULTIPLE_CHOICE";
  const points = q.points ? Number(q.points) : 1;
  const questionText = q.questionText || q.prompt || q.text || "";
  const explanation = q.explanation || "";

  if (type === "MULTIPLE_CHOICE") {
    const rawOptions = Array.isArray(q.options) ? q.options : [];
    const options = rawOptions.map((o: any, idx: number) => {
      if (typeof o === "string") {
        // If option is a simple string, check if it starts with an asterisk as correct indicator
        const isCorrect = o.startsWith("*");
        const optionText = isCorrect ? o.substring(1).trim() : o.trim();
        return {
          optionText,
          isCorrect,
          sortOrder: idx,
        };
      }
      return {
        optionText: o.optionText || o.text || "",
        isCorrect: !!o.isCorrect || !!o.correct,
        sortOrder: o.sortOrder !== undefined ? Number(o.sortOrder) : idx,
      };
    });
    // Check if at least one correct option exists, otherwise mark first one
    if (options.length > 0 && !options.some((o: any) => o.isCorrect)) {
      options[0].isCorrect = true;
    }
    return { type, questionText, points, explanation, options };
  } else {
    const correctAnswers = Array.isArray(q.correctAnswers) 
      ? q.correctAnswers 
      : typeof q.correctAnswer === "string" 
      ? [q.correctAnswer] 
      : typeof q.answer === "string"
      ? [q.answer]
      : [];
    return { type, questionText, points, explanation, correctAnswers };
  }
}

function parseQuestionBlock(lines: string[]): ParsedQuestion | null {
  if (lines.length === 0) return null;

  let questionText = "";
  let explanation = "";
  let type: ExerciseType = "MULTIPLE_CHOICE";
  let points = 1;
  
  const optionsRaw: { text: string; isCorrect: boolean }[] = [];
  const correctAnswersRaw: string[] = [];

  // Find index of first option/answer to know where question prompt ends
  let promptLines: string[] = [];
  let isParsingPrompt = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this line is an option (A., B., C., D.) or answer/explanation
    const isMcOption = /^[a-fA-F][\.\)]\s*/.test(line) || /^\*[a-fA-F][\.\)]\s*/.test(line) || /^[a-fA-F][\.\)]\s*\*/.test(line);
    const isFibAnswer = line.toLowerCase().startsWith("answer:") || line.toLowerCase().startsWith("key:") || line.toLowerCase().startsWith("answers:");
    const isExplanation = line.toLowerCase().startsWith("explanation:") || line.toLowerCase().startsWith("explain:") || line.toLowerCase().startsWith("hint:");
    const isPoints = line.toLowerCase().startsWith("points:") || line.toLowerCase().startsWith("point:");

    if (isMcOption || isFibAnswer || isExplanation || isPoints) {
      isParsingPrompt = false;
    }

    if (isParsingPrompt) {
      promptLines.push(lines[i]);
    } else {
      if (isMcOption) {
        type = "MULTIPLE_CHOICE";
        // Check if line indicates correct answer
        const isCorrect = line.startsWith("*") || line.includes("(*)") || line.includes("[x]") || line.includes("correct") || line.endsWith("*");
        
        // Clean option line
        let cleanedText = line;
        if (cleanedText.startsWith("*")) cleanedText = cleanedText.substring(1).trim();
        if (cleanedText.endsWith("*")) cleanedText = cleanedText.substring(0, cleanedText.length - 1).trim();
        cleanedText = cleanedText.replace(/^\[x\]/i, "").replace(/^\(\*\)/, "").trim();
        
        // Match option prefix and remove it (e.g. "A.", "A)")
        cleanedText = cleanedText.replace(/^[a-fA-F][\.\)]\s*/, "").replace(/^\*\s*/, "").trim();
        
        optionsRaw.push({ text: cleanedText, isCorrect });
      } else if (isFibAnswer) {
        type = "FILL_IN_BLANK";
        const val = line.substring(line.indexOf(":") + 1).trim();
        // Split by '|' or '/' or ',' for multiple acceptable answers
        const answers = val.split(/[\|\/,]/).map(a => a.trim()).filter(Boolean);
        correctAnswersRaw.push(...answers);
      } else if (isExplanation) {
        explanation = line.substring(line.indexOf(":") + 1).trim();
      } else if (isPoints) {
        points = parseInt(line.substring(line.indexOf(":") + 1).trim()) || 1;
      }
    }
  }

  // Clean prompt text from number prefixes (e.g. "1. She is..." -> "She is...")
  questionText = promptLines.join("\n").trim();
  questionText = questionText.replace(/^\d+[\.\)]\s*/, "").replace(/^[qQ]\d+[\.\):]\s*/, "").trim();

  if (!questionText) return null;

  if (type === "MULTIPLE_CHOICE") {
    // If no option is marked as correct, make the first one correct as fallback
    let hasCorrect = optionsRaw.some(o => o.isCorrect);
    if (optionsRaw.length > 0 && !hasCorrect) {
      optionsRaw[0].isCorrect = true;
    }
    const options = optionsRaw.map((o, idx) => ({
      optionText: o.text,
      isCorrect: o.isCorrect,
      sortOrder: idx,
    }));
    return { type, questionText, points, explanation, options };
  } else {
    return { type, questionText, points, explanation, correctAnswers: correctAnswersRaw };
  }
}
