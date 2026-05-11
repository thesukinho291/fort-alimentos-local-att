import { describe, expect, it } from "vitest";
import { formatCnpj, isValidCnpj, normalizeCnpj, normalizePhone } from "@/lib/cnpj";

describe("cnpj helpers", () => {
  it("normalizes and formats CNPJ values", () => {
    expect(normalizeCnpj("12.345.678/0001-95")).toBe("12345678000195");
    expect(formatCnpj("12345678000195")).toBe("12.345.678/0001-95");
  });

  it("validates CNPJ check digits", () => {
    expect(isValidCnpj("12.345.678/0001-95")).toBe(true);
    expect(isValidCnpj("12.345.678/0001-99")).toBe(false);
  });

  it("normalizes WhatsApp phones with Brazil country code", () => {
    expect(normalizePhone("(15) 99113-8912")).toBe("5515991138912");
    expect(normalizePhone("+55 15 99113-8912")).toBe("5515991138912");
  });
});
