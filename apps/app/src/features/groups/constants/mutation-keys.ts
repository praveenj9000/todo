export const GROUP_MUTATION_KEYS = {
  create: ["groups", "create"] as const,
  update: ["groups", "update"] as const,
  delete: ["groups", "delete"] as const,
  addMember: ["groups", "members", "add"] as const,
  removeMember: ["groups", "members", "remove"] as const,
};
