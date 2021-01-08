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

export const parse: (eventString: string) => ParsedEvent = (eventString) => {
  const result = chrono.parse(eventString)[0];
  const title = eventString.substr(0, result.index);
  const hasTime = hasTimeSpecified(result);

  return {
    title,
    startDate: result.start.date(),
    endDate: result?.end?.date(),
    hasTime,
  };
};
