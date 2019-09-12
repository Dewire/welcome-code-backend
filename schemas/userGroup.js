const userGroupSchema = {
  id: {
    type: String,
    hashKey: true,
  },
  adminGroups: {
    type: [String],
  },
};

export default userGroupSchema;
