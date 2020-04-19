import * as vscode from 'vscode';
import { InvokeTaskProvider } from './taskProvider';

export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "pyinvoke" is now active!');

    context.subscriptions.push(
        vscode.tasks.registerTaskProvider("pyinvoke", new InvokeTaskProvider())
    );
}

// this method is called when your extension is deactivated
export function deactivate() { }
