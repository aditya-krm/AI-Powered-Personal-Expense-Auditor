module.exports = {
  apps: [
    {
      name: "money-bot",
      script: "src/index.ts",
      interpreter: "bun",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
