import React from "react";

export const areEqual = (
  prevProps: Record<string, any>,
  nextProps: Record<string, any>,
) => {
  const keys = Object.keys(prevProps);
  for (const key of keys) {
    if (prevProps[key] !== nextProps[key]) return false;
  }
  return true;
};

export function memo<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
) {
  return React.memo(Component, areEqual);
}
