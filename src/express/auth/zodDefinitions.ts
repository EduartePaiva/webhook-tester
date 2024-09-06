import { z } from "zod";

export const resetPasswordToken = z.object({
    resetId: z.string(),
});
