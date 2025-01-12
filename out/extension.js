"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const TreeFormatter_1 = require("./formatters/TreeFormatter");
const FileSystemService_1 = require("./services/FileSystemService");
function activate(context) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('No workspace folder is open');
        return;
    }
    const fileSystemService = new FileSystemService_1.FileSystemService(workspaceRoot);
    let disposable = vscode.commands.registerCommand('directoryTree.generateTree', async () => {
        try {
            // Получаем настройки
            const config = vscode.workspace.getConfiguration('directoryTree');
            const showSize = config.get('showSize', false);
            const aiMinimalMode = config.get('aiMinimalMode', false);
            const importantExtensions = config.get('importantExtensions', []);
            // Создаем форматтер с настройками
            const formatter = new TreeFormatter_1.TreeFormatter({
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
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error generating directory tree: ${error}`);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map