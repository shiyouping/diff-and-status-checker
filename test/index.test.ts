import * as main from "../src/main";

describe("index.ts", () => {
  test("calls run when imported", async () => {
    const runMock = jest.spyOn(main, "run").mockImplementation();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("../src/index");
    expect(runMock).toHaveBeenCalled();
  });
});
