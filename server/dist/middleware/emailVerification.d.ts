import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const requireEmailVerification: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalEmailVerification: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=emailVerification.d.ts.map