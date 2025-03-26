// utils.js

import { OTP_REGEX, PASSWORD_REGEX } from "./const";
import { MESSAGES } from "./string";

export const validateVerificationCode = (verificationCode) => {
  if (!OTP_REGEX.test(verificationCode)) {
    return MESSAGES.INVALID_OTP;
  }
  return "";
};

export const validatePassword = (password) => {
  if (!PASSWORD_REGEX.test(password)) {
    return MESSAGES.INVALID_PASSWORD;
  }
  return "";
};
