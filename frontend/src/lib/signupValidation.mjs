import { loginWithApi, registerWithApi } from "../services/authApi.mjs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minimumPasswordLength = 8;

export function validateSignup(values) {
  const name = values.name.trim();
  const email = values.email.trim();
  const password = values.password;
  const confirmPassword = values.confirmPassword;
  const errors = {};

  if (!name) {
    errors.name = "Full name is required.";
  } else if (name.length < 2) {
    errors.name = "Full name must be at least 2 characters.";
  }

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

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (password && confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      name,
      email,
      password,
      confirmPassword,
    },
  };
}

function mapSignupError(error) {
  if (error.status === 409) {
    return "An account with this email already exists.";
  }

  if (error.status === 400) {
    return "Check your email and password, then try again.";
  }

  return error.message;
}

export async function authenticateSignup(values) {
  const result = validateSignup(values);

  if (!result.isValid) {
    return result;
  }

  try {
    const user = await registerWithApi({
      email: result.values.email,
      password: result.values.password,
      role: "customer",
    });
    const loginPayload = await loginWithApi({
      email: result.values.email,
      password: result.values.password,
    });

    return {
      ...result,
      token: loginPayload.token,
      user: {
        ...user,
        name: result.values.name,
      },
    };
  } catch (error) {
    return {
      ...result,
      isValid: false,
      errors: {
        form: mapSignupError(error),
      },
    };
  }
}
