export function getApiBase() {
  const env = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (env) {
    return env;
  }

  return "http://localhost:5000";
}