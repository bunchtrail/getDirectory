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
const TreeFormatterService_1 = require("./application/services/TreeFormatterService");
const GenerateTreeUseCase_1 = require("./application/useCases/GenerateTreeUseCase");
const FileSystemTreeGenerator_1 = require("./infrastructure/adapters/FileSystemTreeGenerator");
const GenerateTreeCommand_1 = require("./presentation/commands/GenerateTreeCommand");
function activate(context) {
    // Создаем экземпляры классов
    const treeGenerator = new FileSystemTreeGenerator_1.FileSystemTreeGenerator();
    const treeFormatter = new TreeFormatterService_1.TreeFormatterService();
    const generateTreeUseCase = new GenerateTreeUseCase_1.GenerateTreeUseCase(treeGenerator, treeFormatter);
    const generateTreeCommand = new GenerateTreeCommand_1.GenerateTreeCommand(generateTreeUseCase);
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
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map