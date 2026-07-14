import { z } from "zod";

import {
  EMAIL_REQUIRED_MESSAGE,
  INVALID_EMAIL_MESSAGE,
  MIN_PASSWORD_LENGTH,
  PASSWORD_REQUIRED_MESSAGE,
  PASSWORDS_DONT_MATCH_MESSAGE,
} from "../constants/auth.constants";

export const LoginSchema = z.object({
  email: z
    .email(INVALID_EMAIL_MESSAGE)
    .min(1, EMAIL_REQUIRED_MESSAGE),

  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      PASSWORD_REQUIRED_MESSAGE
    ),
});

export const SignupSchema = z
  .object({
    email: z
      .email(INVALID_EMAIL_MESSAGE)
      .min(1, EMAIL_REQUIRED_MESSAGE),

    password: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH,
        PASSWORD_REQUIRED_MESSAGE
      ),

    confirmPassword: z.string(),
  })
  .refine(
    data => data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: PASSWORDS_DONT_MATCH_MESSAGE,
    }
  );

export const ForgotPasswordSchema = z.object({
  email: z
    .email(INVALID_EMAIL_MESSAGE)
    .min(1, EMAIL_REQUIRED_MESSAGE),
});