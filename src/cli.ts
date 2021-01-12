import { getOAuth2Client } from "./google/gAuth";
import GCal from "./google/gcal";
import GTasks from "./google/gTasks";
import {
  parsedResultToGCalEvent,
  parsedResultToGTask,
} from "./google/transform";
import { INPUT_TYPE_EVENT, INPUT_TYPE_TASK, readTuiInput } from "./tui/tui";

(async () => {
  const oAuth2Client = await getOAuth2Client();

  const calendarObject = await readTuiInput();
  if (calendarObject.type === null || calendarObject.body === null) {
    return;
  }

  switch (calendarObject.type) {
    case INPUT_TYPE_EVENT: {
      const gCal = new GCal(oAuth2Client);
      return await gCal.createEvent(
        parsedResultToGCalEvent(calendarObject.body)
      );
    }
    case INPUT_TYPE_TASK: {
      const gTasks = new GTasks(oAuth2Client);
      return await gTasks.createTask(parsedResultToGTask(calendarObject.body));
    }
  }
})();
