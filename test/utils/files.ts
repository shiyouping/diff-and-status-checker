import * as fs from "fs";
import * as path from "path";

export const readFile = (fileName: string): string => {
  const filePath = path.resolve(__dirname, "..", "data", fileName);
  return fs.readFileSync(filePath, "utf8");
};
