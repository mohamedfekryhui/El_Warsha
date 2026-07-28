"use client";
import { useRef, useCallback } from "react";

/**
 * Hook to add drag-to-resize handles to table columns.
 * Usage: const { startResize, getColStyle } = useResizableColumns(initialWidths);
 * initialWidths: array of numbers (px) per column, e.g. [40, 200, 120, ...]
 */
export function useResizableColumns(initialWidths) {
  const colWidths = useRef([...initialWidths]);
  const originalWidths = useRef([...initialWidths]);
  const thRefs = useRef([]);

  const startResize = useCallback((e, colIndex) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths.current[colIndex];

    const onMouseMove = (moveEvent) => {
      const delta = startX - moveEvent.clientX; // RTL: drag left = wider
      const newWidth = Math.max(40, startWidth + delta);
      colWidths.current[colIndex] = newWidth;
      if (thRefs.current[colIndex]) {
        thRefs.current[colIndex].style.width = `${newWidth}px`;
        thRefs.current[colIndex].style.minWidth = `${newWidth}px`;
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  const setThRef = useCallback((el, index) => {
    thRefs.current[index] = el;
    if (el) {
      el.style.width = `${colWidths.current[index]}px`;
      el.style.minWidth = `${colWidths.current[index]}px`;
    }
  }, []);

  const resetResize = useCallback((colIndex) => {
    const originalWidth = originalWidths.current[colIndex];
    colWidths.current[colIndex] = originalWidth;
    if (thRefs.current[colIndex]) {
      thRefs.current[colIndex].style.width = `${originalWidth}px`;
      thRefs.current[colIndex].style.minWidth = `${originalWidth}px`;
    }
  }, []);

  return { startResize, setThRef, resetResize };
}
