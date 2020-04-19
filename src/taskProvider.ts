import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as vscode from 'vscode';
import { TASK_DEFINITION_TYPE } from './const';
import { InvokeTaskDefinition } from './task';
import { Configurations, parseConfigurations } from './configurations';

const buildTask = (taskName: string, workspace: vscode.WorkspaceFolder, config: Configurations): vscode.Task => {
    const cwd = workspace.uri.fsPath;

    const command = [config.path];
    if (config.echo) {
        command.push("-e");
    }
    if (config.configuration) {
        command.push("-f", config.configuration);
    }
    command.push(taskName);

    const escapedCommandLine = command.map(v => v.replace(/(\s+)/g, '\\$1')).join(" ");

    return new vscode.Task(
        {
            type: TASK_DEFINITION_TYPE,
            task: taskName,
        } as InvokeTaskDefinition,
        workspace,
        taskName,
        TASK_DEFINITION_TYPE,
        new vscode.ShellExecution(escapedCommandLine, { cwd }),
        ""
    );
};

export class InvokeTaskProvider implements vscode.TaskProvider {

    provideTasks(token?: vscode.CancellationToken | undefined): vscode.ProviderResult<vscode.Task[]> {

        const tasks = [] as vscode.Task[];

        vscode.workspace.workspaceFolders?.forEach(async (workspace) => {

            const config = parseConfigurations(workspace);

            if (!fs.existsSync(path.join(workspace.uri.fsPath, "tasks.py")) &&
                !fs.existsSync(path.join(workspace.uri.fsPath, "tasks"))) {
                return;
            }

            try {
                const cwd = workspace.uri.fsPath;
                const listOutput = child_process.execSync(`${config.path} --complete`, { cwd });
                const taskNames = listOutput.toString().trim().split("\n");
                taskNames.forEach((taskName) => {
                    tasks.push(buildTask(taskName, workspace, config));
                });
            } catch {
                return;
            }
        });

        return tasks;
    }

    resolveTask(task: vscode.Task, token?: vscode.CancellationToken | undefined): vscode.ProviderResult<vscode.Task> {
        if (task.definition.type !== TASK_DEFINITION_TYPE) {
            return null;
        }
        const workspace = task.scope as vscode.WorkspaceFolder;
        const conf = parseConfigurations(workspace);
        const definition = task.definition as InvokeTaskDefinition;

        const cwd = definition.cwd ?? conf.cwd ?? workspace.uri.path;

        const command = [definition.path ?? conf.path];
        if (definition.echo ?? conf.echo) {
            command.push("-e");
        }
        if (definition.configuration) {
            command.push("-f", definition.configuration);
        } else if (conf.configuration) {
            command.push("-f", conf.configuration);
        }

        if (typeof (definition.task) === "string") {
            command.push(definition.task);
        } else {
            command.push(...definition.task);
        }
        const escapedCommandLine = command.map(v => v.replace(/(\s+)/g, '\\$1')).join(" ");
        task.execution = new vscode.ShellExecution(
            escapedCommandLine,
            { cwd });
        return task;
    }
}
