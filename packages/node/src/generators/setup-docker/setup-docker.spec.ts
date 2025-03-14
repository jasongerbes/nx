import { readProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { applicationGenerator } from '../application/application';
describe('setupDockerGenerator', () => {
  let tree: Tree;
  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('integrated', () => {
    it('should create docker assets when --docker is passed', async () => {
      await applicationGenerator(tree, {
        name: 'api',
        framework: 'express',
        e2eTestRunner: 'none',
        docker: true,
      });

      const project = readProjectConfiguration(tree, 'api');

      expect(tree.exists('api/Dockerfile')).toBeTruthy();
      expect(project.targets).toEqual(
        expect.objectContaining({
          'docker-build': {
            dependsOn: ['build'],
            executor: 'nx:run-commands',
            options: {
              commands: ['docker build -f api/Dockerfile . -t api'],
            },
          },
        })
      );
    });
  });

  describe('standalone', () => {
    it('should create docker assets when --docker is passed', async () => {
      await applicationGenerator(tree, {
        name: 'api',
        framework: 'fastify',
        rootProject: true,
        docker: true,
      });

      const project = readProjectConfiguration(tree, 'api');
      expect(tree.exists('Dockerfile')).toBeTruthy();
      expect(project.targets).toEqual(
        expect.objectContaining({
          'docker-build': {
            dependsOn: ['build'],
            executor: 'nx:run-commands',
            options: {
              commands: ['docker build -f Dockerfile . -t api'],
            },
          },
        })
      );
    });
  });
});
