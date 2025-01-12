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
exports.FileSystemService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class FileSystemService {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
    }
    async buildDirectoryTree(dirPath) {
        const relativePath = path.relative(this.workspaceRoot, dirPath);
        const stats = await fs.promises.stat(dirPath);
        if (!stats.isDirectory()) {
            return {
                name: path.basename(dirPath),
                type: 'file',
                isDirectory: false,
                size: stats.size
            };
        }
        const entries = await fs.promises.readdir(dirPath);
        const children = await Promise.all(entries
            .filter(entry => !entry.startsWith('.')) // Игнорируем скрытые файлы
            .map(async (entry) => {
            const fullPath = path.join(dirPath, entry);
            try {
                return await this.buildDirectoryTree(fullPath);
            }
            catch (error) {
                console.error(`Error processing ${fullPath}:`, error);
                return null;
            }
        }));
        return {
            name: path.basename(dirPath),
            type: 'directory',
            isDirectory: true,
            children: children.filter((child) => child !== null)
        };
    }
    async getWorkspaceStats() {
        let totalSize = 0;
        let fileCount = 0;
        let dirCount = 0;
        const processDirectory = async (dirPath) => {
            const entries = await fs.promises.readdir(dirPath);
            for (const entry of entries) {
                if (entry.startsWith('.'))
                    continue;
                const fullPath = path.join(dirPath, entry);
                const stats = await fs.promises.stat(fullPath);
                if (stats.isDirectory()) {
                    dirCount++;
                    await processDirectory(fullPath);
                }
                else {
                    fileCount++;
                    totalSize += stats.size;
                }
            }
        };
        await processDirectory(this.workspaceRoot);
        return {
            totalSize,
            fileCount,
            dirCount
        };
    }
    isDirectory(path) {
        try {
            return fs.statSync(path).isDirectory();
        }
        catch {
            return false;
        }
    }
    exists(path) {
        try {
            fs.accessSync(path);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.FileSystemService = FileSystemService;
//# sourceMappingURL=FileSystemService.js.map