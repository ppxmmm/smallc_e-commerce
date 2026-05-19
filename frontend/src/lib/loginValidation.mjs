const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minimumPasswordLength = 8;
const demoAccount = {
  email: "customer@smallc.test",
  password: "correct-password",
};

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

export async function authenticateLogin(values) {
  const result = validateLogin(values);

  if (!result.isValid) {
    return result;
  }

  await new Promise((resolve) => {
    globalThis.setTimeout(resolve, 250);
  });

  if (
    result.values.email.toLowerCase() !== demoAccount.email ||
    result.values.password !== demoAccount.password
  ) {
    return {
      ...result,
      isValid: false,
      errors: {
        form: "Email or password is incorrect.",
      },
    };
  }

  return result;
}
