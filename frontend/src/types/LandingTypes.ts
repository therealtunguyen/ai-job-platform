import type { ComponentType } from "react";

export type User = {
  fullName: string;
  role: string;
};

export type Stats = {
  icon: ComponentType<Record<string, unknown>>;
  label: string;
  value: string;
};
