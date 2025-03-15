import jwt from "jsonwebtoken";
import base64 from "base-64";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set in your .env file
console.log("jwt secret", JWT_SECRET);
export interface DecodedToken {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

const removePrefix = (encodedString: string) => {
  const prefix = "base64-";

  // Check if the string starts with the prefix
  if (encodedString.startsWith(prefix)) {
    return encodedString.slice(prefix.length); // Remove the prefix
  }

  return encodedString; // Return the string unchanged if the prefix isn't found
};

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // let cookie = req.cookies['sb-yzultmotrelptzwfwtjh-auth-token'];
  // let cookie= req.cookies['sb-yzultmotrelptzwfwtjh-auth-token.0'] + req.cookies['sb-yzultmotrelptzwfwtjh-auth-token.1']
  // if (!cookie)
  //   cookie= req.cookies['sb-yzultmotrelptzwfwtjh-auth-token.0'] + req.cookies['sb-yzultmotrelptzwfwtjh-auth-token.1']

  //   const cookiePart1 = req.cookies['sb-yzultmotrelptzwfwtjh-auth-token.0'];
  // const cookiePart2 = req.cookies['sb-yzultmotrelptzwfwtjh-auth-token.1'];
  // const cookie = cookiePart1 && cookiePart2 ? cookiePart1 + cookiePart2 : null;
  // console.log("cookie in authtoken", cookie)

  let cookie;

  if (req.cookies["sb-yzultmotrelptzwfwtjh-auth-token"])
    cookie = req.cookies["sb-yzultmotrelptzwfwtjh-auth-token"];
  else
    cookie =
      req.cookies["sb-yzultmotrelptzwfwtjh-auth-token.0"] +
      req.cookies["sb-yzultmotrelptzwfwtjh-auth-token.1"];
      
  if (!cookie) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  let token = removePrefix(cookie);
  console.log("token after prefix ", token);
  const decodedToken = base64.decode(token);
  // console.log("cookie after decoding", token)
  try {
    // const decoded = jwt.verify(decodedToken, JWT_SECRET!) as DecodedToken;
    // const decoded = jwt.verify(token, "bgOQdheBe+16h0+PwJKedlpRSYu697Ee0xiruiDTslqqkcvuzv9EJKJPfs9rA1Il3dkSee+fie8NPiMjcyrb0Q==") as DecodedToken;
    let tmp = JSON.parse(decodedToken);
    const decoded = jwt.verify(tmp.access_token, JWT_SECRET!);
    // console.log("decoded value", decoded)
    // Assign the entire decoded token to req.user
    // req.user = decoded;
    // req.user = decoded.user

    next();
  } catch (err) {
    console.log("in catch of middleware", err);
    res.status(403).json({ error: "Invalid token" });
    return;
  }
};
