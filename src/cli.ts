import GCal from "./google/gcal";
import { parsedEventToGCalEvent } from "./google/transform";
import Tui from "./tui";

(async () => {
  const gCal = await GCal.getInstance();
  const tui = new Tui();
  const event = await tui.read();
  if (event === null) {
    return;
  }

  await gCal.createEvent(parsedEventToGCalEvent(event));
})();
