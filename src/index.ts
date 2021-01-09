import GCal from "./gcal";

(async () => {
  const gCal = await GCal.getInstance();
  await gCal.listEvents();
})();
