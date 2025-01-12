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
exports.TreeFormatter = void 0;
const vscode = __importStar(require("vscode"));
class TreeFormatter {
    static formatTreeForAI(node) {
        const config = vscode.workspace.getConfiguration('directoryTree');
        const showSize = config.get('showSize') || false;
        const aiMinimalMode = config.get('aiMinimalMode') || false;
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
    static buildMinimalTree(node) {
        // Базовый объект
        const result = {
            name: node.name,
            type: node.isDirectory ? "directory" : "file"
        };
        // Для схлопнутых директорий
        if (node.isPlaceholder) {
            if (node.children_skipped) {
                result.children_skipped = node.children_skipped;
                result.children = "skipped";
            }
            else {
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
    static formatTreeForHuman(node, prefix = '') {
        const config = vscode.workspace.getConfiguration('directoryTree');
        const showSize = config.get('showSize') || false;
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
        }
        else if (node.children === "skipped") {
            const childPrefix = prefix + '�