import Cookies from "js-cookie";

export const setUserIDInCookie = (userID: string, days: number = 7) => {
  Cookies.set("userID", userID, { expires: days });
};
export const getUserIDFromCookie = (): string | undefined => {
  return Cookies.get("userID");
};

export const removeUserIDFromCookie = () => {
  Cookies.remove("userID");
};
