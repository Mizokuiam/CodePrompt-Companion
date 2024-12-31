import * as path from 'path';
import * as cp from 'child_process';

import {
    downloadAndUnzipVSCode,
    resolveCliArgsFromVSCodeExecutablePath,
    runTests
} from '@vscode/test-electron';

async function main() {
    try {
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');
        const extensionTestsPath = path.resolve(__dirname, './suite/index');
        const vscodeExecutablePath = await downloadAndUnzipVSCode('stable');
        const [cliPath, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

        cp.spawnSync(cliPath, [...args, '--install-extension', 'dbaeumer.vscode-eslint'], {
            encoding: 'utf-8',
            stdio: 'inherit'
        });

        await runTests({
            vscodeExecutablePath,
            extensionDevelopmentPath,
            extensionTestsPath
        });
    } catch (err) {
        console.error('Failed to run tests');
        process.exit(1);
    }
}

main();
