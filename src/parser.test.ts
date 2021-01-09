import { parse } from "./parser";

describe("invalid input", () => {
  test("no date or time specified", () => {
    const result = parse("dental appointment");
    expect(result).toBeNull();
  });
});

const refDate = new Date("2021-01-08T16:30:00Z");

describe("valid input", () => {
  test("start date specified", () => {
    const rawResult = parse("grocery shopping tomorrow", refDate);
    expect(rawResult).not.toBeNull();

    const result = rawResult!;

    expect(result.title).toStrictEqual("grocery shopping");
    expect(result.hasTime).toBe(false);

    expect(result.startDate.getFullYear()).toStrictEqual(2021);
    expect(result.startDate.getMonth()).toStrictEqual(0);
    expect(result.startDate.getDate()).toStrictEqual(9);

    expect(result.endDate).toBeUndefined();
  });

  test("start and end dates specified", () => {
    const rawResult = parse("tutorial slot allocation 12-13 Jan", refDate);
    expect(rawResult).not.toBeNull();

    const result = rawResult!;

    expect(result.title).toStrictEqual("tutorial slot allocation");
    expect(result.hasTime).toBe(false);

    expect(result.startDate.getFullYear()).toStrictEqual(2021);
    expect(result.startDate.getMonth()).toStrictEqual(0);
    expect(result.startDate.getDate()).toStrictEqual(12);

    expect(result.endDate.getFullYear()).toStrictEqual(2021);
    expect(result.endDate.getMonth()).toStrictEqual(0);
    expect(result.endDate.getDate()).toStrictEqual(13);
  });

  test("start time specified", () => {
    const rawResult = parse("dental appointment tomorrow 430pm", refDate);
    expect(rawResult).not.toBeNull();

    const result = rawResult!;

    expect(result.title).toStrictEqual("dental appointment");
    expect(result.hasTime).toBe(true);

    expect(result.startDate.getFullYear()).toStrictEqual(2021);
    expect(result.startDate.getMonth()).toStrictEqual(0);
    expect(result.startDate.getDate()).toStrictEqual(9);
    expect(result.startDate.getHours()).toStrictEqual(16);
    expect(result.startDate.getMinutes()).toStrictEqual(30);

    expect(result.endDate).toBeUndefined();
  });

  test("start and end time specified", () => {
    const rawResult = parse(
      "Flight A283 to Seattle 1132pm 31 Jan - 1018 1 Feb 2021",
      refDate
    );
    expect(rawResult).not.toBeNull();

    const result = rawResult!;

    expect(result.title).toStrictEqual("Flight A283 to Seattle");
    expect(result.hasTime).toBe(true);

    expect(result.startDate.getFullYear()).toStrictEqual(2021);
    expect(result.startDate.getMonth()).toStrictEqual(0);
    expect(result.startDate.getDate()).toStrictEqual(31);
    expect(result.startDate.getHours()).toStrictEqual(23);
    expect(result.startDate.getMinutes()).toStrictEqual(32);

    expect(result.endDate.getFullYear()).toStrictEqual(2021);
    expect(result.endDate.getMonth()).toStrictEqual(1);
    expect(result.endDate.getDate()).toStrictEqual(1);
    expect(result.endDate.getHours()).toStrictEqual(10);
    expect(result.endDate.getMinutes()).toStrictEqual(18);
  });
});
