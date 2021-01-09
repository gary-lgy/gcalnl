import * as chrono from "chrono-node";

export interface ParsedEvent {
  title: string;
  startDate: Date;
  endDate?: Date;
  hasTime: boolean;
}

const hasTimeSpecified: (result: chrono.ParsedResult) => boolean = (result) => {
  return result.start.isCertain("hour");
};

export const parse: (
  eventString: string,
  refDate?: Date
) => ParsedEvent | null = (eventString, refDate) => {
  const results = chrono.parse(eventString, refDate);
  // TODO: when will it return multiple results?
  if (results.length < 1) {
    return null;
  }

  const result = results[0];
  const title = eventString.substr(0, result.index).trim();
  const hasTime = hasTimeSpecified(result);

  return {
    title,
    startDate: result.start.date(),
    endDate: result?.end?.date(),
    hasTime,
  };
};
