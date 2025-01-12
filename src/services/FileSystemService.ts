import * as fs from 'fs';
import * as path from 'path';
import { TreeNode } from '../types';

export class FileSystemService {
    constructor(private workspaceRoot: string) {}

    public async buildDirectoryTree(dirPath: string): Promise<TreeNode> {
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
        const children = await Promise.all(
            entries
                .filter(entry => !entry.startsWith('.')) // Игнорируем скрытые файлы
                .map(async entry => {
                    const fullPath = path.join(dirPath, entry);
                    try {
                        return await this.buildDirectoryTree(fullPath);
                    } catch (error) {
                        console.error(`Error processing ${fullPath}:`, error);
                        return null;
                    }
                })
        );

        return {
            name: path.basename(dirPath),
            type: 'directory',
            isDirectory: true,
            children: children.filter((child): child is TreeNode => child !== null)
        };
    }

    public async getWorkspaceStats(): Promise<{
        totalSize: number;
        fileCount: number;
        dirCount: number;
    }> {
        let totalSize = 0;
        let fileCount = 0;
        let dirCount = 0;

        const processDirectory = async (dirPath: string) => {
            const entries = await fs.promises.readdir(dirPath);

            for (const entry of entries) {
                if (entry.startsWith('.')) continue;

                const fullPath = path.join(dirPath, entry);
                const stats = await fs.promises.stat(fullPath);

                if (stats.isDirectory()) {
                    dirCount++;
                    await processDirectory(fullPath);
                } else {
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

    public isDirectory(path: string): boolean {
        try {
            return fs.statSync(path).isDirectory();
        } catch {
            return false;
        }
    }

    public exists(path: string): boolean {
        try {
            fs.accessSync(path);
            return true;
        } catch {
            return false;
        }
    }
} 