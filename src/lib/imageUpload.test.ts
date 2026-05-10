import { describe, expect, it } from "vitest";
import {
  IMAGE_UPLOAD_ACCEPT,
  MAX_IMAGE_SIZE_BYTES,
  getValidatedImageExtension,
  validateImageFile,
} from "@/lib/imageUpload";

describe("image upload validation", () => {
  it("limits the browser picker to safe image formats", () => {
    expect(IMAGE_UPLOAD_ACCEPT).toBe("image/jpeg,image/png,image/webp");
  });

  it("accepts jpg, png and webp images", () => {
    expect(getValidatedImageExtension(new File(["image"], "produto.jpg", { type: "image/jpeg" }))).toBe("jpg");
    expect(getValidatedImageExtension(new File(["image"], "produto.png", { type: "image/png" }))).toBe("png");
    expect(getValidatedImageExtension(new File(["image"], "produto.webp", { type: "image/webp" }))).toBe("webp");
  });

  it("rejects svg images", () => {
    const file = new File(["<svg></svg>"], "logo.svg", { type: "image/svg+xml" });

    expect(() => validateImageFile(file)).toThrow("Formato invalido");
  });

  it("rejects images larger than 5 MB", () => {
    const file = new File([new Uint8Array(MAX_IMAGE_SIZE_BYTES + 1)], "banner.jpg", { type: "image/jpeg" });

    expect(() => validateImageFile(file)).toThrow("5 MB");
  });

  it("rejects mismatched extensions and mime types", () => {
    const file = new File(["image"], "produto.png", { type: "image/jpeg" });

    expect(() => validateImageFile(file)).toThrow("nao corresponde");
  });
});
