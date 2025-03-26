import { useState, useEffect } from "react";

const TypewriterText = ({ text, speed = 75 }) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text.charAt(index));
        setIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [index, text, speed]);

  return (
    <span>
      {displayText}
      {index < text.length && <span className="animate-pulse">|</span>}
    </span>
  );
};

export default TypewriterText;
