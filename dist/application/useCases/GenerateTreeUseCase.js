"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateTreeUseCase = void 0;
class GenerateTreeUseCase {
    constructor(treeGenerator, treeFormatter) {
        this.treeGenerator = treeGenerator;
        this.treeFormatter = treeFormatter;
    }
    async execute(rootPath, options, format = 'human') {
        try {
            const tree = await this.treeGenerator.generateTree(rootPath, options);
            if (format === 'ai') {
                return this.treeFormatter.formatForAI(tree);
            }
            else {
                return this.treeFormatter.formatForHuman(tree);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to generate tree: ${errorMessage}`);
        }
    }
}
exports.GenerateTreeUseCase = GenerateTreeUseCase;
//# sourceMappingURL=GenerateTreeUseCase.js.map