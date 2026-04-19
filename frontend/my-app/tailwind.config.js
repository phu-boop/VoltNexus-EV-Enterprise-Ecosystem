/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      // Font Poppins (chúng ta đã thêm ở index.html)
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      // Keyframes và animation cho hiệu ứng xoay màu
      keyframes: {
        animateBg: {
          "100%": { filter: "hue-rotate(360deg)" },
        },
      },
      animation: {
        "hue-rotate": "animateBg 5s linear infinite",
      },
    },
  },
  plugins: [],
};
