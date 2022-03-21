module.exports = {
  name: "Basic",
  run: async (browser) => {
    await new Promise((resolve) => setTimeout(resolve, 2 * 1000));
  },
};
