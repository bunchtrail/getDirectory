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
exports.GenerateTreeCommand = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const TreeOptions_1 = require("../../domain/valueObjects/TreeOptions");
class GenerateTreeCommand {
    constructor(generateTreeUseCase) {
        this.generateTreeUseCase = generateTreeUseCase;
        this.disposables = [];
        this.disposables.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('directoryTree.autoSave')) {
                this.updateWatcher();
            }
        }));
    }
    getDocsPath(rootPath) {
        const docsPath = path.join(rootPath, 'docs');
        if (!fs.existsSync(docsPath)) {
            fs.mkdirSync(docsPath, { recursive: true });
        }
        return docsPath;
    }
    async toggleAutoSave() {
        const config = vscode.workspace.getConfiguration('directoryTree');
        const currentValue = config.get('autoSave');
        const newValue = !currentValue;
        await config.update('autoSave', newValue, vscode.ConfigurationTarget.Global);
        if (newValue) {
            // Если автосохранение включено, создаем файл если его нет
            await this.execute('ai', true);
        }
        vscode.window.showInformationMessage(`Directory Tree Auto Save: ${newValue ? 'Enabled' : 'Disabled'}`);
    }
    async execute(format = 'human', silent = false) {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                throw new Error('No workspace folder is open');
            }
            const rootPath = workspaceFolders[0].uri.fsPath;
            const config = vscode.workspace.getConfiguration('directoryTree');
            const options = new TreeOptions_1.TreeOptionsBuilder()
                .withExcludePatterns(config.get('excludePatterns') || [])
                .withMaxDepth(config.get('maxDepth') || -1)
                .withShowFiles(true)
                .withShowSize(config.get('showSize') || true)
                .withAIMinimalMode(config.get('aiMinimalMode') || false)
                .build();
            const result = await this.generateTreeUseCase.execute(rootPath, options, format);
            // Определяем путь к файлу
            const fileName = format === 'ai' ? 'project-structure.json' : 'project-structure.txt';
            const filePath = format === 'ai'
                ? path.join(this.getDocsPath(rootPath), fileName)
                : path.join(rootPath, fileName);
            const uri = vscode.Uri.file(filePath);
            // Проверяем, изменилось ли содержимое
            const newHash = this.hashContent(result);
            if (format === 'ai' && this.lastFileHash === newHash) {
                return; // Пропускаем сохранение, если содержимое не изменилось
            }
            this.lastFileHash = newHash;
            // Сохраняем файл
            await vscode.workspace.fs.writeFile(uri, Buffer.from(result));
            // Открываем файл только если это не тихое обновление
            if (!silent) {
                const document = await vscode.workspace.openTextDocument(uri);
                await vscode.languages.setTextDocumentLanguage(document, format === 'ai' ? 'jsonc' : 'plaintext');
                await vscode.window.showTextDocument(document, {
                    preview: false,
                    viewColumn: vscode.ViewColumn.Beside
                });
                vscode.window.showInformationMessage(`Directory tree saved to ${fileName}`);
            }
            // Проверяем настройку автосохранения и обновляем watcher
            if (format === 'ai') {
                this.updateWatcher();
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            if (!silent) {
                vscode.window.showErrorMessage(`Failed to generate tree: ${errorMessage}`);
            }
        }
    }
    hashContent(content) {
        return require('crypto').createHash('md5').update(content).digest('hex');
    }
    updateWatcher() {
        if (this.watcher) {
            this.watcher.dispose();
            this.watcher = undefined;
        }
        const config = vscode.workspace.getConfiguration('directoryTree');
        const autoSave = config.get('autoSave');
        if (autoSave && vscode.workspace.workspaceFolders) {
            const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const excludePatterns = config.get('excludePatterns') || [];
            this.watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(rootPath, '**/*'), false, false, false);
            const handleFileChange = async () => {
                await this.execute('ai', true); // Тихое обновление
            };
            const shouldHandleChange = (uri) => {
                const relativePath = path.relative(rootPath, uri.fsPath);
                if (relativePath.startsWith('docs/') ||
                    excludePatterns.some(pattern => relativePath.includes(pattern))) {
                    return false;
                }
                return true;
            };
            this.watcher.onDidCreate(uri => shouldHandleChange(uri) && handleFileChange());
            this.watcher.onDidDelete(uri => shouldHandleChange(uri) && handleFileChange());
            this.watcher.onDidChange(uri => shouldHandleChange(uri) && handleFileChange());
        }
    }
    dispose() {
        if (this.watcher) {
            this.watcher.dispose();
        }
        this.disposables.forEach(d => d.dispose());
    }
}
exports.GenerateTreeCommand = GenerateTreeCommand;
//# sourceMappingURL=GenerateTreeCommand.js.map