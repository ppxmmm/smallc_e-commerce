export type SignupValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SignupValidationErrors = Partial<
  Record<keyof SignupValues | "form", string>
>;

export type AuthUser = {
  id: number;
  email: string;
  role: string;
  name?: string;
};

export function validateSignup(values: SignupValues): {
  isValid: boolean;
  errors: SignupValidationErrors;
  values: SignupValues;
};

export function authenticateSignup(values: SignupValues): Promise<{
  isValid: boolean;
  errors: SignupValidationErrors;
  values: SignupValues;
  token?: string;
  user?: AuthUser;
}>;
