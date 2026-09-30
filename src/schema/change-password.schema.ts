import { z } from "zod";

export const passwordSetSchema = z
    .object({
        oldPassword: z
            .string()
            .min(6, "Password must be at least 6 characters long"),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long"),
        confirmPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type PasswordSetValues = z.infer<typeof passwordSetSchema>;
