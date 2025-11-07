import React, { useState, useEffect } from "react";

const ScrollProgressBar = () => {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollTop = window.scrollY;
      setScroll((scrollTop / totalHeight) * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "4px",
        width: `${scroll}%`,
        backgroundColor: "#d2691e", // coffee color 😎
        zIndex: 9999,
        transition: "width 0.2s ease-out",
      }}
    />
  );
};

export default ScrollProgressBar;
