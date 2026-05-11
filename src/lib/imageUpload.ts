export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
export const IMAGE_UPLOAD_ACCEPT = ALLOWED_IMAGE_MIME_TYPES.join(",");

type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
type AllowedImageExtension = (typeof ALLOWED_IMAGE_EXTENSIONS)[number];

const EXTENSION_BY_MIME_TYPE: Record<AllowedImageMimeType, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MIME_TYPES_BY_EXTENSION: Record<AllowedImageExtension, AllowedImageMimeType[]> = {
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
};

const ALLOWED_FORMATS_LABEL = "JPG, PNG ou WebP";

function isAllowedMimeType(type: string): type is AllowedImageMimeType {
  return ALLOWED_IMAGE_MIME_TYPES.includes(type as AllowedImageMimeType);
}

function isAllowedExtension(extension: string): extension is AllowedImageExtension {
  return ALLOWED_IMAGE_EXTENSIONS.includes(extension as AllowedImageExtension);
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

export function validateImageFile(file: File) {
  if (file.size <= 0) {
    throw new Error("A imagem selecionada esta vazia.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("A imagem deve ter no maximo 5 MB.");
  }

  if (!isAllowedMimeType(file.type)) {
    throw new Error(`Formato invalido. Use ${ALLOWED_FORMATS_LABEL}.`);
  }

  const extension = getFileExtension(file.name);
  if (!isAllowedExtension(extension)) {
    throw new Error(`Extensao invalida. Use ${ALLOWED_FORMATS_LABEL}.`);
  }

  if (!MIME_TYPES_BY_EXTENSION[extension].includes(file.type)) {
    throw new Error("A extensao do arquivo nao corresponde ao formato da imagem.");
  }
}

export function getValidatedImageExtension(file: File) {
  validateImageFile(file);
  return EXTENSION_BY_MIME_TYPE[file.type as AllowedImageMimeType];
}
