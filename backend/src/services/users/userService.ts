// Placeholder for user profile service
export const findUserById = async (userId: string) => {
  console.log(`Finding user ${userId}`);
  return { id: userId, name: "Jane Doe", email: "jane.doe@example.com" };
};
