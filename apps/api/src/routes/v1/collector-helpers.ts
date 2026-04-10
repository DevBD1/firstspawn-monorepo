import { z } from "zod";

const cursorSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
});

export interface TargetsCursor {
  id: string;
  createdAt: Date;
}

export const encodeTargetsCursor = (value: TargetsCursor): string => {
  const raw = JSON.stringify({
    id: value.id,
    created_at: value.createdAt.toISOString(),
  });

  return Buffer.from(raw, "utf8").toString("base64url");
};

export const decodeTargetsCursor = (cursor: string): TargetsCursor => {
  const raw = Buffer.from(cursor, "base64url").toString("utf8");
  const parsed = cursorSchema.parse(JSON.parse(raw));

  return {
    id: parsed.id,
    createdAt: new Date(parsed.created_at),
  };
};
