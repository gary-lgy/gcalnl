import GCal from "./google/gcal";
import { parsedEventToGCalEvent } from "./google/transform";
import { readTuiInput } from "./tui/tui";

(async () => {
  const gCal = await GCal.getInstance();
  const event = await readTuiInput();
  if (event === null) {
    return;
  }

  await gCal.createEvent(parsedEventToGCalEvent(event));
})();
