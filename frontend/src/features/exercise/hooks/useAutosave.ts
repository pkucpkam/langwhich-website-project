import { useEffect, useRef, useState } from "react";
import { usePracticeStore } from "../store/practice.store";
import { exerciseApi } from "../api";

export function useAutosave() {
  const attemptId = usePracticeStore((state) => state.attemptId);
  const answers = usePracticeStore((state) => state.answers);
  const savedAnswers = usePracticeStore((state) => state.savedAnswers);
  const markAsSaved = usePracticeStore((state) => state.markAsSaved);
  const [isAutosaving, setIsAutosaving] = useState(false);

  const timeoutRefs = useRef<Record<number, NodeJS.Timeout>>({});

  useEffect(() => {
    if (!attemptId) return;

    Object.entries(answers).forEach(([qIdStr, answer]) => {
      const qId = parseInt(qIdStr);
      
      // Check if this specific answer needs saving
      if (savedAnswers[qId] === false) {
        if (timeoutRefs.current[qId]) {
          clearTimeout(timeoutRefs.current[qId]);
        }

        timeoutRefs.current[qId] = setTimeout(async () => {
          try {
            setIsAutosaving(true);
            await exerciseApi.saveAnswer(attemptId, {
              questionId: qId,
              payload: answer,
            });
            markAsSaved(qId, true);
          } catch (error) {
            console.error("Autosave failed for question ID:", qId, error);
          } finally {
            setIsAutosaving(false);
          }
        }, 1000); // 1000ms debounce window
      }
    });
  }, [answers, savedAnswers, attemptId, markAsSaved]);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, []);

  return { isAutosaving };
}
export default useAutosave;
