import * as vscode from 'vscode';
import { TreeFormatterService } from './application/services/TreeFormatterService';
import { GenerateTreeUseCase } from './application/useCases/GenerateTreeUseCase';
import { FileSystemTreeGenerator } from './infrastructure/adapters/FileSystemTreeGenerator';
import { GenerateTreeCommand } from './presentation/commands/GenerateTreeCommand';

export function activate(context: vscode.ExtensionContext) {
    // Создаем экземпляры классов
    const treeGenerator = new FileSystemTreeGenerator();
    const treeFormatter = new TreeFormatterService();
    const generateTreeUseCase = new GenerateTreeUseCase(treeGenerator, treeFormatter);
    const generateTreeCommand = new GenerateTreeCommand(generateTreeUseCase);

    // Регистрируем команды
    let disposables = [
        vscode.commands.registerCommand('directoryTree.generateTree', () => {
            generateTreeCommand.execute('human');
        }),
        vscode.commands.registerCommand('directoryTree.generateTreeForAI', () => {
            generateTreeCommand.execute('ai');
        }),
        vscode.commands.registerCommand('directoryTree.generateTreeForHuman', () => {
            generateTreeCommand.execute('human');
        }),
        vscode.commands.registerCommand('directoryTree.toggleAutoSave', () => {
            generateTreeCommand.toggleAutoSave();
        }),
        generateTreeCommand
    ];

    context.subscriptions.push(...disposables);
}

export function deactivate() {} 