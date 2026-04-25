import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { resolveConfig, type HonchoFileConfig } from "./config";

const ORIG_PROFILE = process.env.HONCHO_PROFILE;
const ORIG_API_KEY = process.env.HONCHO_API_KEY;

beforeEach(() => {
  delete process.env.HONCHO_PROFILE;
  delete process.env.HONCHO_API_KEY;
});

afterEach(() => {
  if (ORIG_PROFILE !== undefined) process.env.HONCHO_PROFILE = ORIG_PROFILE;
  if (ORIG_API_KEY !== undefined) process.env.HONCHO_API_KEY = ORIG_API_KEY;
});

const baseRaw: HonchoFileConfig = {
  apiKey: "test-key",
  peerName: "tester",
  hosts: {
    claude_code: { workspace: "hermes", aiPeer: "coder" },
    "claude_code.director": { workspace: "7stars", aiPeer: "director" },
  },
};

describe("resolveConfig — profile-aware host block lookup", () => {
  test("HONCHO_PROFILE unset → returns bare claude_code block", () => {
    const config = resolveConfig(baseRaw, "claude_code");
    expect(config).not.toBeNull();
    expect(config!.workspace).toBe("hermes");
    expect(config!.aiPeer).toBe("coder");
    expect(config!.profile).toBeUndefined();
  });

  test("HONCHO_PROFILE=director + matching block → returns profile block", () => {
    process.env.HONCHO_PROFILE = "director";
    const config = resolveConfig(baseRaw, "claude_code");
    expect(config).not.toBeNull();
    expect(config!.workspace).toBe("7stars");
    expect(config!.aiPeer).toBe("director");
    expect(config!.profile).toBe("director");
  });
});
