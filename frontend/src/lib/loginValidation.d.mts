export type LoginValues = {
  email: string;
  password: string;
};

export type LoginValidationErrors = Partial<
  Record<keyof LoginValues | "form", string>
>;

export function validateLogin(values: LoginValues): {
  isValid: boolean;
  errors: LoginValidationErrors;
  values: LoginValues;
};

export type AuthUser = {
  id: number;
  email: string;
  role: string;
  name?: string;
};

export function authenticateLogin(values: LoginValues): Promise<{
  isValid: boolean;
  errors: LoginValidationErrors;
  values: LoginValues;
  token?: string;
  user?: AuthUser;
}>;
