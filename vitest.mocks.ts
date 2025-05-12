import { vi } from "vitest";

const browser = {
  i18n: {
    getMessage: vi.fn(),
  },
  storage: {},
};
vi.stubGlobal("browser", browser);
