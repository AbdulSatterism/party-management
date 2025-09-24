/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import { jwtHelper } from '../../helpers/jwtHelper';
import AppError from '../errors/AppError';
import { User } from '../modules/user/user.model';

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extracting token from authorization header
      const tokenWithBearer = req.headers.authorization;
      if (!tokenWithBearer || !tokenWithBearer.startsWith('Bearer ')) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }

      // Get the token
      const token = tokenWithBearer.split(' ')[1];

      // Verify the token using the jwtHelper
      let decodedUser;
      try {
        decodedUser = jwtHelper.verifyToken(
          token,
          config.jwt.jwt_secret as Secret,
        );
      } catch (error) {
        if ((error as any).name === 'TokenExpiredError') {
          throw new AppError(StatusCodes.UNAUTHORIZED, 'Token has expired');
        }
        throw error;
      }

      req.user = decodedUser;

      const user_role = await User.findById(decodedUser.id);

      if (roles.length && !roles.includes(user_role?.role ?? '')) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "You don't have permission to access this API",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;

// const auth =
//   (...roles: string[]) =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const tokenWithBearer = req.headers.authorization;
//       if (!tokenWithBearer) {
//         throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
//       }

//       if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
//         const token = tokenWithBearer.split(' ')[1];

//         //verify token
//         const verifyUser = jwtHelper.verifyToken(
//           token,
//           config.jwt.jwt_secret as Secret,
//         );
//         //set user to header
//         req.user = verifyUser;

//         //guard user
//         if (roles.length && !roles.includes(verifyUser.role)) {
//           throw new AppError(
//             StatusCodes.FORBIDDEN,
//             "You don't have permission to access this api",
//           );
//         }

//         next();
//       }
//     } catch (error) {
//       next(error);
//     }
//   };

// export default auth;
