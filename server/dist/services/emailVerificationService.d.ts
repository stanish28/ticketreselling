export declare const generateVerificationToken: (userId: string) => string;
export declare const sendVerificationEmail: (email: string, name: string, token: string) => Promise<void>;
export declare const verifyEmailToken: (token: string) => Promise<{
    success: boolean;
    userId?: string;
    error?: string;
}>;
export declare const resendVerificationEmail: (email: string) => Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=emailVerificationService.d.ts.map