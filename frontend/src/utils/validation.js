const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const passwordRuleText =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";

export const validateEmail = (email = "") => emailRegex.test(email.trim());

export const validatePassword = (password = "") => passwordRegex.test(password);
