export declare const generatePasswordResetToken: (userId: string) => string;
export declare const sendPasswordResetEmail: (email: string, name: string, token: string) => Promise<void>;
export declare const verifyPasswordResetToken: (token: string) => Promise<{
    success: boolean;
    userId?: string;
    error?: string;
}>;
export declare const resetPassword: (userId: string, newPassword: string) => Promise<{
    success: boolean;
    error?: string;
}>;
export declare const requestPasswordReset: (email: string) => Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=passwordResetService.d.ts.map