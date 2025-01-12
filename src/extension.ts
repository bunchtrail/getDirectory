import * as vscode from 'vscode';
import { TreeFormatter } from './formatters/TreeFormatter';
import { FileSystemService } from './services/FileSystemService';

export function activate(context: vscode.ExtensionContext) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('No workspace folder is open');
        return;
    }

    const fileSystemService = new FileSystemService(workspaceRoot);

    let disposable = vscode.commands.registerCommand('directoryTree.generateTree', async () => {
        try {
            // Получаем настройки
            const config = vscode.workspace.getConfiguration('directoryTree');
            const showSize = config.get<boolean>('showSize', false);
            const aiMinimalMode = config.get<boolean>('aiMinimalMode', false);
            const importantExtensions = config.get<string[]>('importantExtensions', []);

            // Создаем форматтер с настройками
            const formatter = new TreeFormatter({
                showSize,
                aiMinimalMode,
                importantExtensions
            });

            // Получаем дерево директорий
            const tree = await fileSystemService.buildDirectoryTree(workspaceRoot);

            // Создаем новый документ для вывода
            const document = await vscode.workspace.openTextDocument({
                content: '',
                language: 'markdown'
            });

            const editor = await vscode.window.showTextDocument(document);

            // Форматируем дерево в зависимости от режима
            const output = aiMinimalMode
                ? JSON.stringify(formatter.formatTreeForAI(tree), null, 2)
                : formatter.formatTreeForHuman(tree);

            // Вставляем отформатированное дерево
            await editor.edit(editBuilder => {
                editBuilder.insert(new vscode.Position(0, 0), output);
            });

            vscode.window.showInformationMessage('Directory tree generated successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating directory tree: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {} 