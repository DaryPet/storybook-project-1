import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  bodyParser: {
    sizeLimit: "10mb", // Увеличиваем лимит на 10 МБ
  },
};

export default nextConfig;
