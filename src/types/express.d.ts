
// import { DecodedToken } from "../middleware";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: DecodedToken;
//     }
//   }
// }



import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
}