import fs from 'node:fs';
import path from 'node:path';

const isRecursive = process.argv.includes('--recursive') || process.argv.includes('-r');

// Uses the directory where you typed the terminal command, fallback to cwd
const targetDir = process.env.INIT_CWD || process.cwd();
const outputFile = 'combined_output.txt';

const validExtensions = new Set(['.mjs', '.ts', '.tsx', '.js', '.jsx', '.json']);
const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', '.next']);

function getFiles(dir, recursive = false) {
    let results = [];
    let entries = [];

    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
        console.error(`Unable to read directory: ${dir}`);
        return results;
    }

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (recursive && !ignoreDirs.has(entry.name)) {
                results = results.concat(getFiles(fullPath, true));
            }
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (validExtensions.has(ext) && entry.name !== outputFile) {
                results.push(fullPath);
            }
        }
    }
    return results;
}

function dumpFiles() {
    const files = getFiles(targetDir, isRecursive);
    let output = '';

    for (const file of files) {
        const relativePath = path.relative(targetDir, file);
        const content = fs.readFileSync(file, 'utf8');
        output += `// ./${relativePath}\n${content}\n\n`;
    }

    const outputPath = path.join(targetDir, outputFile);
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`Successfully dumped ${files.length} file(s) to ${outputPath} (Mode: ${isRecursive ? 'Recursive' : 'Current Folder Only'})`);
}

dumpFiles();