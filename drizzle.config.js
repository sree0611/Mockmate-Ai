/**@type {import("drizzle-kit").Config} */

export default {
  schema: "./utils/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:zPofQerpF28K@ep-patient-mountain-a5o2jhq3.us-east-2.aws.neon.tech/Ai-interview-mocker?sslmode=require",
  },
};
