// utils.js

export const validateForm = (email, password) => {
  return email !== "" && password !== "";
};

export const handleRememberMeChange = (rememberMe, setRememberMe) => {
  const confirmSave =
    !rememberMe && window.confirm("Are you sure to save your account?");
  setRememberMe(confirmSave ? true : rememberMe);
};
