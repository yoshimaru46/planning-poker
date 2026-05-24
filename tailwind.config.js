/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "card-pop": {
          "0%":   { transform: "scale(0.7) translateY(8px)", opacity: "0" },
          "60%":  { transform: "scale(1.1) translateY(-2px)" },
          "100%": { transform: "scale(1) translateY(0)",    opacity: "1" },
        },

        "card-dismiss": {
          "0%":   { transform: "scale(1) translateY(0)",    opacity: "1" },
          "100%": { transform: "scale(0.4) translateY(16px)", opacity: "0" },
        },
      },
      animation: {
        "card-pop":     "card-pop 0.25s ease-out",
        "card-dismiss": "card-dismiss 0.3s ease-in forwards",
      },
    },
  },
  plugins: [],
};
