module.exports = {
  name: "One",
  run: async (browser) => {
    await new Promise((resolve) => setTimeout(resolve, 3 * 1000));
    expect(false).toBe(true);
  },
};
