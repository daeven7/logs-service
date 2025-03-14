// import jwt from 'jsonwebtoken';
// import base64 from 'base-64';
// import { Request, Response, NextFunction } from 'express';

// const JWT_SECRET = process.env.JWT_SECRET; // Ensure you have this set in your .env file

// interface DecodedToken {
//   user: {
//     id: string;
//     email: string;
//     role: string;
//   };
// }


// export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
//   // Get the cookie from the request
//   const cookie = req.cookies['sb-yzultmotrelptzwfwtjh-auth-token'];

//   if (!cookie) {
//     return res.status(401).json({ error: 'No token provided' });
//   }

//   // Decode the base64-encoded token
//   const decodedToken = base64.decode(cookie);

//   try {
//     // Verify the JWT token
//     const decoded = jwt.verify(decodedToken, JWT_SECRET!) as DecodedToken;

//     // Attach the decoded token to the request object
//     req.user = decoded;

//     // Proceed to the next middleware or route handler
//     next();
//   } catch (err) {
//     return res.status(403).json({ error: 'Invalid token' });
//   }
// };


// import jwt from 'jsonwebtoken';
// import base64 from 'base-64';
// import { Request, Response, NextFunction } from 'express';
// import dotenv from 'dotenv';
// dotenv.config();

// const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set in your .env file
// console.log("jwt secret", JWT_SECRET)
// export interface DecodedToken {
//   user: {
//     id: string;
//     email: string;
//     role: string;
//   };
// }

// export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
//   // Get the cookie from the request
//   const cookie = req.cookies['sb-yzultmotrelptzwfwtjh-auth-token'];

//   if (!cookie) {
//     return res.status(401).json({ error: 'No token provided' });
//   }

//   // Decode the base64-encoded token
//   const decodedToken = base64.decode(cookie);

//   try {
//     // Verify the JWT token
//     const decoded = jwt.verify(decodedToken, JWT_SECRET!) as DecodedToken;

//     // Attach the decoded token to the request object
//     req.user = decoded.user;

//     // Proceed to the next middleware or route handler
//     next();
//   } catch (err) {
//     return res.status(403).json({ error: 'Invalid token' });
//   }
// };


import jwt from 'jsonwebtoken';
import base64 from 'base-64';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set in your .env file
console.log("jwt secret", JWT_SECRET)
export interface DecodedToken {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

const removePrefix= (encodedString:string) =>{
  const prefix = "base64-";
  
  // Check if the string starts with the prefix
  if (encodedString.startsWith(prefix)) {
    return encodedString.slice(prefix.length); // Remove the prefix
  }
  
  return encodedString; // Return the string unchanged if the prefix isn't found
}


export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const cookie = req.cookies['sb-yzultmotrelptzwfwtjh-auth-token'];
  // console.log("cookie in authtoken", cookie)
    if (!cookie) {
      res.status(401).json({ error: 'No token provided' });
      return
    }
    
    // let token = removePrefix(cookie)
    // let token="eyJhbGciOiJIUzI1NiIsImtpZCI6Ik5QcWFrTldMVW5qQWRib3IiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3l6dWx0bW90cmVscHR6d2Z3dGpoLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2OWNlYWIzYS0wMmMyLTRiMTEtYTQ4Ni02NzRjMjRkMGYwOTYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQxOTY1MTEyLCJpYXQiOjE3NDE5NjE1MTIsImVtYWlsIjoiZGFldmVuYmFycmV0b0B5YWhvby5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoiZGFldmVuYmFycmV0b0B5YWhvby5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiI2OWNlYWIzYS0wMmMyLTRiMTEtYTQ4Ni02NzRjMjRkMGYwOTYifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc0MTk1MzIxNH1dLCJzZXNzaW9uX2lkIjoiNjAxNGQ0MjUtMzFhYy00MmY1LWFlYzMtMTMzN2YwMmFmYThiIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.VmO9WZoLcBZgfvOz_5jsMMJK0d_ROmHH2hIfQEL1MMA"

    // const decodedToken = base64.decode(token);
    let token = removePrefix(cookie)
    const decodedToken = base64.decode(token);
    console.log("cookie after decoding", token)
    try {
      // const decoded = jwt.verify(decodedToken, JWT_SECRET!) as DecodedToken;
      // const decoded = jwt.verify(token, "bgOQdheBe+16h0+PwJKedlpRSYu697Ee0xiruiDTslqqkcvuzv9EJKJPfs9rA1Il3dkSee+fie8NPiMjcyrb0Q==") as DecodedToken;
      let tmp= JSON.parse(decodedToken)
      const decoded = jwt.verify(tmp.access_token, JWT_SECRET!)
      // console.log("decoded value", decoded)
      // Assign the entire decoded token to req.user
      // req.user = decoded;
      // req.user = decoded.user
      
      next();
    } catch (err) {
      console.log("in catch of middleware", err)
       res.status(403).json({ error: 'Invalid token' });
       return
    }
  };
  