import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { GenerateTreeUseCase } from '../../application/useCases/GenerateTreeUseCase';
import { TreeOptionsBuilder } from '../../domain/valueObjects/TreeOptions';

export class GenerateTreeCommand {
    private watcher: vscode.FileSystemWatcher | undefined;
    private disposables: vscode.Disposable[] = [];
    private lastFileHash: string | undefined;

    constructor(private readonly generateTreeUseCase: GenerateTreeUseCase) {
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('directoryTree.autoSave')) {
                    this.updateWatcher();
                }
            })
        );
    }

    private getDocsPath(rootPath: string): string {
        const docsPath = path.join(rootPath, 'docs');
        if (!fs.existsSync(docsPath)) {
            fs.mkdirSync(docsPath, { recursive: true });
        }
        return docsPath;
    }

    async toggleAutoSave(): Promise<void> {
        const config = vscode.workspace.getConfiguration('directoryTree');
        const currentValue = config.get<boolean>('autoSave');
        const newValue = !currentValue;
        
        await config.update('autoSave', newValue, vscode.ConfigurationTarget.Global);
        
        if (newValue) {
            // Если автосохранение включено, создаем файл если его нет
            await this.execute('ai', true);
        }
        
        vscode.window.showInformationMessage(
            `Directory Tree Auto Save: ${newValue ? 'Enabled' : 'Disabled'}`
        );
    }

    async execute(format: 'ai' | 'human' = 'human', silent: boolean = false): Promise<void> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                throw new Error('No workspace folder is open');
            }

            const rootPath = workspaceFolders[0].uri.fsPath;
            const config = vscode.workspace.getConfiguration('directoryTree');

            const options = new TreeOptionsBuilder()
                .withExcludePatterns(config.get<string[]>('excludePatterns') || [])
                .withMaxDepth(config.get<number>('maxDepth') || -1)
                .withShowFiles(true)
                .withShowSize(config.get<boolean>('showSize') || true)
                .withAIMinimalMode(config.get<boolean>('aiMinimalMode') || false)
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
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            if (!silent) {
                vscode.window.showErrorMessage(`Failed to generate tree: ${errorMessage}`);
            }
        }
    }

    private hashContent(content: string): string {
        return require('crypto').createHash('md5').update(content).digest('hex');
    }

    private updateWatcher(): void {
        if (this.watcher) {
            this.watcher.dispose();
            this.watcher = undefined;
        }

        const config = vscode.workspace.getConfiguration('directoryTree');
        const autoSave = config.get<boolean>('autoSave');

        if (autoSave && vscode.workspace.workspaceFolders) {
            const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const excludePatterns = config.get<string[]>('excludePatterns') || [];
            
            this.watcher = vscode.workspace.createFileSystemWatcher(
                new vscode.RelativePattern(rootPath, '**/*'),
                false,
                false,
                false
            );

            const handleFileChange = async () => {
                await this.execute('ai', true); // Тихое обновление
            };

            const shouldHandleChange = (uri: vscode.Uri) => {
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

    dispose(): void {
        if (this.watcher) {
            this.watcher.dispose();
        }
        this.disposables.forEach(d => d.dispose());
    }
} 