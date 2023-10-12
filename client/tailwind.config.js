/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/*.{.js,jsx}",
    "./src/components/*{.js,jsx}",
    "./src/assets/*.{.js,jsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [       
    require('flowbite/plugin')
  ],
}

