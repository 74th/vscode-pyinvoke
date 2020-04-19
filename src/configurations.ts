import * as vscode from 'vscode';

export interface Configurations {
    path: string
    configuration?: string
    coreOps?: string | string[]
    cwd?: string
    echo: boolean
}

export function parseConfigurations(workspace: vscode.WorkspaceFolder): Configurations {
    const conf = vscode.workspace.getConfiguration("pyinvoke", workspace);
    return {
        path: conf.get<string>("path") ?? "invoke",
        configuration: conf.get<string>("configuration"),
        coreOps: conf.get<string | string[]>("coreOps"),
        cwd: conf.get<string>("cwd"),
        echo: conf.get<boolean>("echo") ?? false,
    };
}
