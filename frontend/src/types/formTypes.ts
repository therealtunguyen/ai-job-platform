export type FormData = {
  email: string;
  password: string;
  role: string;
  rememberMe: boolean;
};

export type FormState = {
  loading: boolean;
  errors: { [key: string]: string };
  showPassword: boolean;
  success: boolean;
};
