
import * as ModuleLoader from '../../../odsp-utilities/modules/ModuleLoader';
import { IRequire } from '../../../odsp-utilities/modules/IRequire';
import { expect } from 'chai';

const ExampleModule1 = {
    a: 1
};

const ExampleModule2 = {
    default: {
        b: 1
    }
};

const ExampleModule3 = {
    test: {
        c: 1
    }
};

describe('ModuleLoader', () => {
    let testRequire: IRequire;

    let modulesByPath: { [path: string]: any; };

    beforeEach(() => {
        modulesByPath = {
            '../test/Module1': ExampleModule1,
            '../test/Module2': ExampleModule2,
            '../test/Module3': ExampleModule3
        };

        testRequire = <T>([path]: string[], onLoad: (module: T) => void) => {
            onLoad(modulesByPath[path]);
        };
    });

    describe('#loadModule', () => {
        it('loads the identity export', () => {
            return ModuleLoader.loadModule<typeof ExampleModule1>({
                path: '../test/Module1',
                require: testRequire
            }).then((module: typeof ExampleModule1) => {
                expect(module).to.equal(ExampleModule1);
            });
        });

        it('loads the default export', () => {
            return ModuleLoader.loadModule<typeof ExampleModule2.default>({
                path: '../test/Module2',
                require: testRequire
            }).then((module: typeof ExampleModule2.default) => {
                expect(module).to.equal(ExampleModule2.default);
            });
        });
    });

    describe('#loadModuleIdentity', () => {
        it('loads the identity export', () => {
            return ModuleLoader.loadModuleIdentity<typeof ExampleModule2>({
                path: '../test/Module2',
                require: testRequire
            }).then((module: typeof ExampleModule2) => {
                expect(module).to.equal(ExampleModule2);
            });
        });
    });

    describe('#loadModuleExport', () => {
        it('loads the selected export', () => {
            return ModuleLoader.loadModuleExport({
                path: '../test/Module3',
                require: testRequire,
                getExport: (module: typeof ExampleModule3) => module.test
            }).then((test: typeof ExampleModule3.test) => {
                expect(test).to.equal(ExampleModule3.test);
            });
        });
    });
});
