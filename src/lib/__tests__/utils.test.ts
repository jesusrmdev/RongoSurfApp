import { describe, it, expect } from "vitest";
import { formatDuration } from "../utils";

describe("formatDuration", () => {
  it("returns hours for RENTAL type", () => {
    expect(formatDuration("RENTAL", 60)).toBe("1h");
    expect(formatDuration("RENTAL", 120)).toBe("2h");
    expect(formatDuration("RENTAL", 180)).toBe("3h");
  });

  it("returns minutes for non-RENTAL types", () => {
    expect(formatDuration("GROUP", 90)).toBe("90 min");
    expect(formatDuration("INDIVIDUAL", 60)).toBe("60 min");
  });

  it("returns days for durations >= 1440 minutes", () => {
    expect(formatDuration("GROUP", 1440)).toBe("1 días");
    expect(formatDuration("GROUP", 2880)).toBe("2 días");
  });
});
