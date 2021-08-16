export const AUTH_SIGNIN = "AUTH_SIGNIN";
export const AUTH_SIGNOUT = "AUTH_SIGNOUT";

export const signOut = () => {
  localStorage.removeItem("jwtToken");
  return { type: AUTH_SIGNOUT };
};

export function signInUser(token, user) {
  localStorage.setItem("jwtToken", token);
  return {
    type: AUTH_SIGNIN,
    payload: user,
  };
}
