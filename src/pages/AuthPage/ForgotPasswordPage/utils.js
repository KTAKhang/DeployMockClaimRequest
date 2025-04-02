export const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

export const formatEmail = (email) => {
  const [localPart, domain] = email.split("@");
  const visibleStart = localPart.slice(0, 2);
  const visibleEnd = localPart.slice(-4);
  return `${visibleStart}*******${visibleEnd}@${domain}`;
};
