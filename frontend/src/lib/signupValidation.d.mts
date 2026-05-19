export type SignupValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SignupValidationErrors = Partial<
  Record<keyof SignupValues, string>
>;

export function validateSignup(values: SignupValues): {
  isValid: boolean;
  errors: SignupValidationErrors;
  values: SignupValues;
};
