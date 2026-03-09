module.exports = {
  apps: [
    {
      name: "nextsuit-api",
      cwd: "/www/wwwroot/studio.tangyikai.top/NextSuit",
      script: "pnpm",
      args: "--filter @nextsuit/api start",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "nextsuit-marketing",
      cwd: "/www/wwwroot/studio.tangyikai.top/NextSuit",
      script: "pnpm",
      args: "--filter @nextsuit/marketing-web start",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "nextsuit-blog",
      cwd: "/www/wwwroot/studio.tangyikai.top/NextSuit",
      script: "pnpm",
      args: "--filter @nextsuit/blog-web start",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
