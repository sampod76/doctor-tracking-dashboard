// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "doctor_tracker_dashboard",
      script: "server.js",
      exec_mode: "cluster",
      instances: "1",
      watch: false,
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3005,
      },
    },
  ],
};
