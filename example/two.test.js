module.exports = {
  name: "Two",
  run: async (browser) => {
    await new Promise((resolve) => setTimeout(resolve, 2 * 1000));
  },
};
