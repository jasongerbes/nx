import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import {
  addProjectConfiguration,
  readProjectConfiguration,
  Tree,
} from '@nrwl/devkit';
import webpackConfigSetup from './webpack-config-setup';

describe('15.6.3 migration (setup webpack.config file)', () => {
  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

    addProjectConfiguration(tree, 'app1', {
      root: 'apps/app1',
      targets: {
        build: {
          executor: '@nrwl/webpack:webpack',
          options: {},
        },
      },
    });
    addProjectConfiguration(tree, 'app2', {
      root: 'apps/app2',
      targets: {
        custom: {
          executor: '@nrwl/webpack:webpack',
          options: {},
        },
      },
    });

    addProjectConfiguration(tree, 'app3', {
      root: 'apps/app3',
      targets: {
        custom: {
          executor: '@nrwl/webpack:webpack',
          options: {
            webpackConfig: 'apps/app3/webpack.config.js',
          },
        },
      },
    });

    tree.write('apps/app3/webpack.config.js', 'some content');

    addProjectConfiguration(tree, 'app4', {
      root: 'apps/app4',
      targets: {
        custom: {
          executor: '@nrwl/webpack:webpack',
          options: {
            webpackConfig: 'some/random/path/webpack.something.ts',
          },
        },
      },
    });

    tree.write('some/random/path/webpack.something.ts', 'some content');

    addProjectConfiguration(tree, 'app5', {
      root: 'apps/app5',
      targets: {
        custom: {
          executor: '@nrwl/webpack:webpack',
          options: {
            isolatedConfig: true,
          },
        },
      },
    });

    await webpackConfigSetup(tree);
  });

  it('should create webpack.config.js for projects that do not have one', () => {
    expect(tree.read('apps/app1/webpack.config.js', 'utf-8')).toMatchSnapshot();
    expect(tree.read('apps/app2/webpack.config.js', 'utf-8')).toMatchSnapshot();
  });

  it('should rename existing webpack.config file and create new one that requires it', () => {
    expect(tree.read('apps/app3/webpack.config.js', 'utf-8')).toMatchSnapshot();
    expect(
      tree.read('apps/app3/webpack.config.old.js', 'utf-8')
    ).toMatchInlineSnapshot(`"some content"`);

    expect(
      tree.read('some/random/path/webpack.something.ts', 'utf-8')
    ).toMatchSnapshot();

    expect(
      tree.read('some/random/path/webpack.something.old.ts', 'utf-8')
    ).toMatchInlineSnapshot(`"some content"`);
  });

  it('should update the project configuration - executor options', () => {
    expect(
      readProjectConfiguration(tree, 'app1').targets.build.options.webpackConfig
    ).toBe('apps/app1/webpack.config.js');
    expect(
      readProjectConfiguration(tree, 'app2').targets.custom.options
        .webpackConfig
    ).toBe('apps/app2/webpack.config.js');

    expect(
      readProjectConfiguration(tree, 'app3').targets.custom.options
        .webpackConfig
    ).toBe('apps/app3/webpack.config.js');

    expect(
      readProjectConfiguration(tree, 'app4').targets.custom.options
        .webpackConfig
    ).toBe('some/random/path/webpack.something.ts');

    expect(
      readProjectConfiguration(tree, 'app1').targets.build.options
        .isolatedConfig
    ).toBeTruthy();
    expect(
      readProjectConfiguration(tree, 'app2').targets.custom.options
        .isolatedConfig
    ).toBeTruthy();

    expect(
      readProjectConfiguration(tree, 'app3').targets.custom.options
        .isolatedConfig
    ).toBeTruthy();

    expect(
      readProjectConfiguration(tree, 'app4').targets.custom.options
        .isolatedConfig
    ).toBeTruthy();
  });

  it('should not do anything if isolatedConfig is true', () => {
    expect(tree.exists('apps/app5/webpack.config.js')).toBeFalsy();
  });
});
