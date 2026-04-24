import validator from "validator";

export const PASSWORD_RULE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const normalizeEmail = (email = "") => email.trim().toLowerCase();

export const validateEmail = (email = "") => validator.isEmail(normalizeEmail(email));

export const validatePassword = (password = "") => passwordRegex.test(password);

export const validateRequiredFields = (fields) =>
  Object.entries(fields)
    .filter(([, value]) => value === undefined || value === null || `${value}`.trim() === "")
    .map(([key]) => key);
