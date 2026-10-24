import "dotenv/config";               // .env file load karta hai
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url: process.env.DATABASE_URL },   // URL yahan hota hai, schema mein nahi
});