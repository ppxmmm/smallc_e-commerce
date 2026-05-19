import { getDisplayName } from "./displayName.mjs";
import { userFromToken } from "./authToken.mjs";
import { loginWithApi } from "../services/authApi.mjs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minimumPasswordLength = 8;

export function validateLogin(values) {
  const email = values.email.trim();
  const password = values.password;
  const errors = {};

  if (!email) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < minimumPasswordLength) {
    errors.password = `Password must be at least ${minimumPasswordLength} characters.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      email,
      password,
    },
  };
}

function mapLoginError(error) {
  if (error.status === 401) {
    return "Email or password is incorrect.";
  }

  if (error.status === 400) {
    return "Email and password are required.";
  }

  return error.message;
}

export async function authenticateLogin(values) {
  const result = validateLogin(values);

  if (!result.isValid) {
    return result;
  }

  try {
    const payload = await loginWithApi(result.values);

    const identity = userFromToken(payload.token);

    return {
      ...result,
      token: payload.token,
      user: {
        id: identity?.id ?? 0,
        email: result.values.email,
        name: getDisplayName({ email: result.values.email }),
        role: identity?.role ?? "customer",
      },
    };
  } catch (error) {
    return {
      ...result,
      isValid: false,
      errors: {
        form: mapLoginError(error),
      },
    };
  }
}
