export const revokeToken = async (token: string) =>
  await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
