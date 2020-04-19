import * as vscode from 'vscode';

export interface InvokeTaskDefinition extends vscode.TaskDefinition {
    path?: string;
    cwd?: string;
    configuration?: string;
    coreOpts?: string | string[];
    task: string | string[];
}
