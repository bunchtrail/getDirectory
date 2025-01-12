import * as vscode from 'vscode';
import { TreeNode } from '../domain/interfaces/ITreeGenerator';

export class TreeFormatter {
    // Список расширений, для которых мы хотим собирать статистику
    private static readonly IMPORTANT_EXTENSIONS = new Set([
        'ts', 'tsx', 'js', 'jsx', 'py', 'java', 'cs', 'go', 'rs',
        'cpp', 'c', 'h', 'hpp', 'css', 'scss', 'html', 'json', 'yaml',
        'yml', 'md', 'sql', 'sh', 'bash', 'ps1', 'php', 'rb'
    ]);

    static formatTreeForAI(node: TreeNode): string {
        const config = vscode.workspace.getConfiguration('directoryTree');
        const showSize = config.get<boolean>('showSize') || false;
        const aiMinimalMode = config.get<boolean>('aiMinimalMode') || false;
        
        // Собираем статистику
        const stats = this.collectStats(node);
        
        if (aiMinimalMode) {
            // Минимальный режим для AI
            const result = {
                meta: {
                    nodes: stats.totalNodes,
                    files: stats.files,
                    dirs: stats.directories,
                    root: node.name
                },
                tree: this.buildMinimalTree(node)
            };
            return JSON.stringify(result, null, 2);
        }

        // Полный режим
        const { nodes, relationships } = this.flattenTree(node);
        const result = {
            metadata: {
                total_nodes: stats.totalNodes,
                total_files: stats.files,
                total_directories: stats.directories,
                max_depth: stats.maxDepth,
                root: node.name,
                show_size: showSize
            },
            extension_stats: stats.extensions,
            nodes: nodes,
            relationships: relationships
        };

        return JSON.stringify(result, null, 2);
    }

    private static buildMinimalTree(node: TreeNode): any {
        // Базовый объект
        const result: any = {
            name: node.name,
            type: node.isDirectory ? "directory" : "file"
        };

        // Для схлопнутых директорий
        if (node.isPlaceholder) {
            if (node.children_skipped) {
                result.children_skipped = node.children_skipped;
                result.children = "skipped";
            } else {
                result.children = [{
                    name: "...",
                    type: "directory",
                    children: []
                }];
            }
            return result;
        }

        // Добавляем дочерние элементы только для директорий с содержимым
        if (node.children && typeof node.children !== 'string' && node.children.length > 0) {
            result.children = node.children.map(child => this.buildMinimalTree(child));
        }

        return result;
    }

    static formatTreeForHuman(node: TreeNode, prefix: string = ''): string {
        const config = vscode.workspace.getConfiguration('directoryTree');
        const showSize = config.get<boolean>('showSize') || false;
        
        let result = '';
        const icon = node.isDirectory ? '📁' : '📄';
        const name = node.name;
        const size = showSize && node.size ? ` (${this.formatSize(node.size)})` : '';
        
        // Добавляем текущий узел
        result += `${prefix}${icon} ${name}${size}\n`;

        // Обрабатываем дочерние элементы
        if (node.children && typeof node.children !== 'string' && node.children.length > 0) {
            // Сортируем: сначала директории, потом файлы
            const sortedChildren = [...node.children].sort((a, b) => {
                if (a.isDirectory === b.isDirectory) {
                    return a.name.localeCompare(b.name);
                }
                return a.isDirectory ? -1 : 1;
            });

            for (let i = 0; i < sortedChildren.length; i++) {
                const child = sortedChildren[i];
                const isLast = i === sortedChildren.length - 1;
                const newPrefix = prefix + (isLast ? '    ' : '│   ');
                const childPrefix = prefix + (isLast ? '└── ' : '├── ');
                result += this.formatTreeForHuman(child, childPrefix);
            }
        } else if (node.children === "skipped") {
            const childPrefix = prefix + '└── ';
            result += `${childPrefix}... (${node.children_skipped} items skipped)\n`;
        }

        return result;
    }

    private static collectStats(node: TreeNode, depth: number = 0): any {
        let stats = {
            totalNodes: 1,
            files: node.isDirectory ? 0 : 1,
            directories: node.isDirectory ? 1 : 0,
            maxDepth: depth,
            extensions: {} as { [key: string]: number }
        };

        if (!node.isDirectory && node.name.includes('.')) {
            const ext = node.name.split('.').pop()!.toLowerCase();
            // Собираем статистику только для важных расширений
            if (this.IMPORTANT_EXTENSIONS.has(ext)) {
                stats.extensions[ext] = (stats.extensions[ext] || 0) + 1;
            }
        }

        if (node.children && typeof node.children !== 'string') {
            node.children.forEach(chil