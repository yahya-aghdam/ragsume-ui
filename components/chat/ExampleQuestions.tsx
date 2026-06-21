"use client";
import { useEffect, useState } from "react";

// A large list of example questions for an AI software engineer working with LLMs and RAG.
const QUESTIONS = [
  "What experience do you have building AI agents or LLM-powered applications?", "Can you walk me through your strongest project in this space?", "Have you worked with vector databases like Qdrant before?", "What's your experience level with Go, and how does it apply here?", "What's an example of a real technical tradeoff you had to make?", "Do you have backend engineering experience outside of AI work?", "What's the most complex system you've built end to end?", "I have a job description — can you tell me how good a fit this is?", "Have you built anything involving authentication or payment systems?", "What would make you a strong hire for an AI agent engineering role?"
];

interface ExampleQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

/**
 * Randomly selects a subset of questions to display.
 * The component memoizes the selection so it stays constant for the session.
 */
export function ExampleQuestions({ onSelectQuestion }: ExampleQuestionsProps) {
  // selected is null during the initial server render.
  // Initialize with empty array to ensure server and client render the same structure.
  const [selected, setSelected] = useState<string[]>([]);

  // After the component mounts on the client, generate a random subset.
  useEffect(() => {
    // Defer state update to avoid synchronous setState warning.
    const timer = setTimeout(() => {
      const shuffled = QUESTIONS.slice().sort(() => Math.random() - 0.5);
      setSelected(shuffled.slice(0, 4));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // While selected is empty (SSR or before effect runs), render placeholder with no items.
  // This keeps the markup consistent between server and client.
  if (selected.length === 0) {
    return (
      <div className="font-mono text-xs text-text-muted">
         <div className="mt-2 text-base font-bold sm:text-lg">You are in AI based resume of `Yahya Parvin Aghdam`</div>
        <p className="mb-2">Try one of these example questions:</p>
        <ul className="list-disc list-inside space-y-1"></ul>
      </div>
    );
  }

  return (
    <div className="font-mono text-xs text-text-muted">
      <div className="mt-2 text-base font-bold sm:text-lg">You are in AI based resume of `Yahya Parvin Aghdam`</div>
      <div className="mt-2 mb-5 break-words">Linkedin: <a href="https://www.linkedin.com/in/yahya-aghdam" target="_blank" className="break-all text-accent hover:underline" >https://www.linkedin.com/in/yahya-aghdam</a></div>
      <p className="mb-2">Try one of these example questions:</p>
      <ul className="grid list-disc list-inside gap-1 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-1">
          {selected.map((q, i) => (
            <li
              key={i}
              className="cursor-pointer break-words hover:underline"
              onClick={() => onSelectQuestion(q)}
            >
              {q}
            </li>
          ))}
      </ul>
      <p className="mt-8">
        You can see the sources in here:
      </p>
      <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
        <span className="mt-1 break-words">
          Core: <a href="https://github.com/yahya-aghdam/ragsume-core" target="_blank" className="break-all text-accent hover:underline" >https://github.com/yahya-aghdam/ragsume-core</a>
        </span>
        <span className="break-words">
          UI: <a href="https://github.com/yahya-aghdam/ragsume-ui" target="_blank" className="break-all text-accent hover:underline">https://github.com/yahya-aghdam/ragsume-ui</a>
        </span>
      </div>
    </div>
  );
}
