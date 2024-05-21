let env = process.env;

export const PORT = env.PORT || 3000;
export const MAX_BODY_SIZE = env.MAX_BODY_SIZE || "100kb";
export const REQUEST_TIMEOUT = env.REQUEST_TIMEOUT || "1s";
