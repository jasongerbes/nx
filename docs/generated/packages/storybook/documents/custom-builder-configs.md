# Custom configurations for Webpack and Vite

Storybook allows you to customize the `webpack` configuration and your `vite` configuration. For that, it offers two fields you can add in your `.storybook/main.js|ts` file, called `webpackFinal` and `viteFinal`. These fields are functions that take the default configuration as an argument, and return the modified configuration. You can read more about them in the [Storybook documentation for `webpack`](https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config) and the [Storybook documentation for `vite`](https://storybook.js.org/docs/react/builders/vite#configuration).

You can use these fields in your Nx workspace Storybook configurations normally, following the Storybook docs. However, let's see how you can create a global configuration for every project in your workspace, and how you can override it for specific projects.

## Global configuration

In your root `.storybook/main.js|ts` file, you can add the `webpackFinal` or `viteFinal` field, and return the modified configuration. This will be applied to every project in your workspace.

### `webpack` and `webpackFinal`

The `webpackFinal` field would look like this:

```ts
webpackFinal: async (config, { configType }) => {
  // Make whatever fine-grained changes you need that should apply to all storybook configs

  // Return the altered config
  return config;
},
```

### `vite` and `viteFinal`

The `viteFinal` field would look like this:

```ts
async viteFinal(config, { configType }) {
   if (configType === 'DEVELOPMENT') {
     // Your development configuration goes here
   }
   if (configType === 'PRODUCTION') {
     // Your production configuration goes here.
   }
   return mergeConfig(config, {
     // Your environment configuration here
   });
 },
```

In the `viteFinal` case, you would have to import the `mergeConfig` function from `vite`. So, on the top of your root `.storybook/main.js|ts` file, you would have to add:

```ts
const { mergeConfig } = require('vite');
```

## Project-specific configuration

### `webpack` and `webpackFinal`

You can customize or extend the global `webpack` configuration for a specific project by adding a `webpackFinal` field in your project-specific `.storybok/main.js|ts` file, like this:

```ts
// apps/my-react-webpack-app/.storybook/main.js

const rootMain = require('../../../.storybook/main');

module.exports = {
  ...rootMain,
  ...
  webpackFinal: async (config, { configType }) => {
    // apply any global webpack configs that might have been specified in .storybook/main.js
    if (rootMain.webpackFinal) {
      config = await rootMain.webpackFinal(config, { configType });
    }

    // add your own webpack tweaks if needed

    return config;
  },
};
```

Take note how we are first applying the global `webpack` configuration, and then adding our own tweaks. If you don't want to apply any global configuration, you can just return your own configuration, and skip the `rootMain.webpackFinal` check.

### `vite` and `viteFinal`

You can customize or extend the global `vite` configuration for a specific project by adding a `viteFinal` field in your project-specific `.storybok/main.js|ts` file.

{% callout type="check" title="Don't forget the vite-tsconfig-paths plugin" %}
For Vite.js to work on monorepos, and specifically on Nx workspaces, you need to use the `'vite-tsconfig-paths'` plugin!
{% /callout %}

It's important to note here that for Vite.js to work on monorepos, and specifically on Nx workspaces, you need to use the `'vite-tsconfig-paths'` plugin, just like you must already do in your project's `vite.config.ts` file. Storybook does not read your project's Vite configuration automatically, so you have to manually add the plugin to your project's Storybook Vite configuration.

So, a project-level `.storybook/main.js|ts` file for a Vite.js project would look like this:

```ts
// apps/my-react-vite-app/.storybook/main.js
const { mergeConfig } = require('vite');
const viteTsConfigPaths = require('vite-tsconfig-paths').default;
const rootMain = require('../../../.storybook/main');

module.exports = {
  ...rootMain,
  core: { ...rootMain.core, builder: '@storybook/builder-vite' },
  stories: [
    ...rootMain.stories,
    '../src/app/**/*.stories.mdx',
    '../src/app/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [...rootMain.addons],
  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      ...((await rootMain.viteFinal(config, { configType })) ?? {}),
      plugins: [
        viteTsConfigPaths({
          root: '../../../',
        }),
      ],
    });
  },
};
```

or just simplified (if you don't want to take into account any global Storybook Vite.js configuration):

```ts
const { mergeConfig } = require('vite');
const viteTsConfigPaths = require('vite-tsconfig-paths').default;
const rootMain = require('../../../.storybook/main');

module.exports = {
  ...rootMain,
  core: { ...rootMain.core, builder: '@storybook/builder-vite' },
  stories: [
    ...rootMain.stories,
    '../src/app/**/*.stories.mdx',
    '../src/app/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [...rootMain.addons],
  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      plugins: [
        viteTsConfigPaths({
          root: '../../../',
        }),
      ],
    });
  },
};
```
