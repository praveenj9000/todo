const requiredEnv = (
    name: string
): string => {
    const value = process.env[name];

    if (!value) {
        throw new Error(
            `Missing environment variable: ${name}`
        );
    }

    return value;
};


export const env = {
  supabase: {
    url: requiredEnv(
      "EXPO_PUBLIC_SUPABASE_URL"
    ),

    publishableKey: requiredEnv(
      "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    ),
  },
};