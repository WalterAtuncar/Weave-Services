import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from 'tailwindcss';

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: (config) => {
    return {
      ...config,
      css: {
        postcss: {
          plugins: [tailwindcss],
        },
      },
    };
  },
};

export default config;