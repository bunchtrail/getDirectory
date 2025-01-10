import * as path from 'path';
import * as vscode from 'vscode';
import { TreeFormatter } from './application/TreeFormatter';
import { TreeOptions } from './domain/interfaces/ITreeGenerator';
import { FileSystemTreeGenerator } from './infrastructure/FileSystemTreeGenerator';

async function ensureDocsDirectory(workspaceFolder: vscode.WorkspaceFolder): Promise<vscode.Uri> {
    const docsUri = vscode.Uri.joinPath(workspaceFolder.uri, 'docs');
    try {
        await vscode.workspace.fs.stat(docsUri);
    } catch {
        // Папка не существует, создаем её
        await vscode.workspace.fs.createDirectory(docsUri);
    }
    return docsUri;
}

export function activate(context: vscode.ExtensionContext) {
    const treeGenerator = new FileSystemTreeGenerator();
    let fileSystemWatcher: vscode.FileSystemWatcher | undefined;

    // Функция для генерации дерева с текущими настройками
    async function generateTreeWithCurrentConfig(workspaceFolder: vscode.WorkspaceFolder) {
        const config = vscode.workspace.getConfiguration('directoryTree');
        const options: TreeOptions = {
            excludePatterns: config.get<string[]>('excludePatterns') || [],
            maxDepth: config.get<number>('maxDepth') || -1,
            showFiles: config.get<boolean>('showFiles') || true,
            showSize: config.get<boolean>('showSize') || false
        };

        const tree = treeGenerator.generateTree(workspaceFolder.uri.fsPath, options);
        const formattedTree = TreeFormatter.formatTree(tree);
        
        const docsUri = await ensureDocsDirectory(workspaceFolder);
        const defaultFilename = config.get<string>('outputFilename') || 'directory-tree.txt';
        const fileUri = vscode.Uri.joinPath(docsUri, defaultFilename);

        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(formattedTree));
        return fileUri;
    }

    // Функция для настройки отслеживания файловой системы
    function setupFileWatcher(workspaceFolder: vscode.WorkspaceFolder) {
        if (fileSystemWatcher) {
            fileSystemWatcher.dispose();
        }

        const config = vscode.workspace.getConfiguration('directoryTree');
        if (!config.get<boolean>('autoUpdate')) {
            return;
        }

        const watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(workspaceFolder, '**/*'),
            false, // Не отслеживаем изменения в файлах
            true,  // Отслеживаем создание файлов
            true   // Отслеживаем удаление файлов
        );

        let updateTimeout: NodeJS.Timeout | undefined;

        const handleFileChange = async () => {
            if (updateTimeout) {
                clearTimeout(updateTimeout);
            }
            
            // Добавляем задержку для группировки множественных изменений
            updateTimeout = setTimeout(async () => {
                try {
                    await generateTreeWithCurrentConfig(workspaceFolder);
                    vscode.window.showInformationMessage('Directory tree updated automatically');
                } catch (error) {
                    vscode.window.showErrorMessage('Error updating directory tree: ' + error);
                }
            }, 1000);
        };

        watcher.onDidCreate(handleFileChange);
        watcher.onDidDelete(handleFileChange);

        fileSystemWatcher = watcher;
        context.subscriptions.push(watcher);
    }

    // Команда для включения/выключения автообновления
    let toggleWatcher = vscode.commands.registerCommand('directory-tree-generator.toggleWatcher', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder is opened');
            return;
        }

        const config = vscode.workspace.getConfiguration('directoryTree');
        const currentValue = config.get<boolean>('autoUpdate');
        
        await config.update('autoUpdate', !currentValue, vscode.ConfigurationTarget.Workspace);
        
        if (!currentValue) {
            setupFileWatcher(workspaceFolder);
            vscode.window.showInformationMessage('Directory tree auto-update enabled');
        } else {
            if (fileSystemWatcher) {
                fileSystemWatcher.dispose();
                fileSystemWatcher = undefined;
            }
            vscode.window.showInformationMessage('Directory tree auto-update disabled');
        }
    });

    let generateTree = vscode.commands.registerCommand('directory-tree-generator.generateTree', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder is opened');
            return;
        }

        try {
            const fileUri = await generateTreeWithCurrentConfig(workspaceFolder);
            const document = await vscode.workspace.openTextDocument(fileUri);
            await vscode.window.showTextDocument(document);
            
            vscode.window.showInformationMessage(`Tree saved in docs/${path.basename(fileUri.fsPath)}`);
        } catch (error) {
            vscode.window.showErrorMessage('Error generating directory tree: ' + error);
        }
    });

    let generateTreeWithConfig = vscode.commands.registerCommand('directory-tree-generator.generateTreeWithConfig', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder is opened');
            return;
        }

        try {
            const config = vscode.workspace.getConfiguration('directoryTree');
            
            // Интерактивный выбор опций
            const showFiles = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: 'Show files in tree?'
            });
            
            const showSize = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: 'Show file sizes?'
            });
            
            const maxDepth = await vscode.window.showInputBox({
                placeHolder: 'Maximum depth (-1 for unlimited)',
                value: '-1'
            });

            const excludePatterns = config.get<string[]>('excludePatterns');
            const excludePatternsInput = await vscode.window.showInputBox({
                placeHolder: 'Exclude patterns (comma-separated)',
                value: excludePatterns ? excludePatterns.join(',') : ''
            });

            const options: TreeOptions = {
                excludePatterns: excludePatternsInput ? excludePatternsInput.split(',').map(p => p.trim()) : [],
                maxDepth: maxDepth ? parseInt(maxDepth) : -1,
                showFiles: showFiles === 'Yes',
                showSize: showSize === 'Yes'
            };

            const tree = treeGenerator.generateTree(workspaceFolder.uri.fsPath, options);
            const formattedTree = TreeFormatter.formatTree(tree);
            
            const docsUri = await ensureDocsDirectory(workspaceFolder);
            
            const defaultFilename = config.get<string>('outputFilename') || 'directory-tree.txt';
            const filename = await vscode.window.showInputBox({
                placeHolder: 'Output filename',
                value: defaultFilename
            });

            if (filename) {
                const fileUri = vscode.Uri.joinPath(docsUri, filename);
                await vscode.workspace.fs.writeFile(fileUri, Buffer.from(formattedTree));
                const document = await vscode.workspace.openTextDocument(fileUri);
                await vscode.window.showTextDocument(document);
                
                vscode.window.showInformationMessage(`Tree saved in docs/${filename}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage('Error generating directory tree: ' + error);
        }
    });

    // Инициализация отслеживания при запуске, если включено в настройках
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
        const config = vscode.workspace.getConfiguration('directoryTree');
        if (config.get<boolean>('autoUpdate')) {
            setupFileWatcher(workspaceFolder);
        }
    }

    context.subscriptions.push(generateTree, generateTreeWithConfig, toggleWatcher);
}

export function deactivate() {} 