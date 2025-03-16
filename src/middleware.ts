import jwt from "jsonwebtoken";
import base64 from "base-64";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { removePrefix } from "./utils/helper";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export interface DecodedToken {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let cookie;

  if (req.cookies["sb-yzultmotrelptzwfwtjh-auth-token"])
    cookie = req.cookies["sb-yzultmotrelptzwfwtjh-auth-token"];
  else
    cookie =
      req.cookies["sb-yzultmotrelptzwfwtjh-auth-token.0"] +
      req.cookies["sb-yzultmotrelptzwfwtjh-auth-token.1"];

  if (!cookie) {
    console.error("No token provided");
    res.status(401).json({ error: "No token provided" });
    return;
  }

  let token = removePrefix(cookie);
  const decodedToken = base64.decode(token);
  try {
    let tmp = JSON.parse(decodedToken);
    const decoded = jwt.verify(tmp.access_token, JWT_SECRET!);

    next();
  } catch (err) {
    console.error("Invalid token error", err);
    res.status(403).json({ error: "Invalid token" });
    return;
  }
};
