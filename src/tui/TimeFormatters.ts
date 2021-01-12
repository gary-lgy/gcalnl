import { format } from "date-fns";

// TODO: consider adding humanized date (e.g., 2 days later)
export const formatDate = (date: Date) => {
  return format(date, "d MMM y");
};

export const formatTime = (date: Date) => {
  return format(date, "HH:mm");
};
