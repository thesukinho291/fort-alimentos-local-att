const CNPJ_LENGTH = 14;

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeCnpj(value: string) {
  return onlyDigits(value).slice(0, CNPJ_LENGTH);
}

export function formatCnpj(value: string) {
  const digits = normalizeCnpj(value);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function isValidCnpj(value: string) {
  const cnpj = normalizeCnpj(value);
  if (cnpj.length !== CNPJ_LENGTH) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const calculateDigit = (base: string, weights: number[]) => {
    const sum = base.split("").reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return cnpj === `${cnpj.slice(0, 12)}${firstDigit}${secondDigit}`;
}

export function normalizePhone(value: string) {
  const digits = onlyDigits(value);
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}
