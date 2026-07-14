import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authService } from "../services/auth.service";
import type { LoginForm } from "../types";
import { LoginSchema } from "../validation/auth.schema";

export function useLogin() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await authService.loginWithEmail(
        values.email,
        values.password
      );

      if (error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  });

  return {
    form,
    loading,
    error,
    onSubmit,
  };
}