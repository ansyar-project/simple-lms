"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 1,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, setScope] = useState<HTMLDivElement | null>(null);
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (scope) {
      const elements = scope.querySelectorAll(".word");
      elements.forEach((element, idx) => {
        setTimeout(() => {
          element.classList.add("opacity-100");
          element.classList.remove("opacity-0");
        }, idx * (duration * 100));
      });
    }
  }, [scope, duration]);

  const renderWords = () => {
    return (
      <motion.div ref={setScope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className={cn(
                "word opacity-0 transition-opacity duration-500",
                filter && "filter blur-sm"
              )}
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
              animate={{
                filter: "blur(0px)",
                opacity: 1,
              }}
              transition={{
                duration: 0.5,
                delay: idx * 0.1,
              }}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={className}>
      <div className="text-black dark:text-white">{renderWords()}</div>
    </div>
  );
};
