const PW_RE = /^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>\/?]).{8,16}$/;

export const validateRegister = ({ name, email, address, password }) => {
  const e = {};
  if (!name || name.trim().length < 20)  e.name = 'Name must be at least 20 characters';
  if (name && name.trim().length > 60)   e.name = 'Name must be at most 60 characters';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
  if (address && address.length > 400)   e.address = 'Address must be at most 400 characters';
  if (!password || !PW_RE.test(password))
    e.password = 'Password: 8–16 chars, at least one uppercase letter and one special character';
  return e;
};

export const validatePassword = (pw) => {
  if (!pw || !PW_RE.test(pw))
    return 'Password: 8–16 chars, at least one uppercase letter and one special character';
  return null;
};
