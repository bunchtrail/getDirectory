import { ITreeGenerator } from '../../domain/ports/ITreeGenerator';
import { TreeOptions } from '../../domain/valueObjects/TreeOptions';
import { TreeFormatterService } from '../services/TreeFormatterService';

export class GenerateTreeUseCase {
    constructor(
        private readonly treeGenerator: ITreeGenerator,
        private readonly treeFormatter: TreeFormatterService
    ) {}

    async execute(
        rootPath: string,
        options: TreeOptions,
        format: 'ai' | 'human' = 'human'
    ): Promise<string> {
        try {
            const tree = await this.treeGenerator.generateTree(rootPath, options);
            
            if (format === 'ai') {
                return this.treeFormatter.formatForAI(tree);
            } else {
                return this.treeFormatter.formatForHuman(tree);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to generate tree: ${errorMessage}`);
        }
    }
} 