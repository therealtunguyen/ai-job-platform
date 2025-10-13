// types/express.d.ts
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        user_type?: string;
        [key: string]: any;
      };
    }
  }
}
