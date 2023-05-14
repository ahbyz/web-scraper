/* eslint-disable prettier/prettier */
const fs = require('fs');
const util = require('util');

function removeCommonElements(file1Path, file2Path, outputPath) {
    try {
        // Read the JSON files
        const file1Data = JSON.parse(fs.readFileSync(file1Path, 'utf-8'));
        const file2Data = JSON.parse(fs.readFileSync(file2Path, 'utf-8'));

        const file1Set = new Set(file1Data);
        const file2Set = new Set(file2Data);

        for (const item of file2Set) {
            if (file1Set.has(item)) {
                file1Set.delete(item);
            }
        }

        const JSONstring = JSON.stringify(Array.from(file1Set));

        // Use util.promisify to convert fs.writeFile to a function that returns a promise
        const writeFile = util.promisify(fs.writeFile);

        // Write the JSON string to a file
        writeFile('ilkSet.json', JSONstring)
            .then(() => console.log('Set successfully written to file'))
            .catch((error) => console.log('An error occurred: ', error));
    } catch (error) {
        console.error('Error processing files:', error);
    }
}

// Usage example
const file1Path = __dirname + '/..' + '/mySet.json';
const file2Path = __dirname + '/..' + '/patlaklar.json';
const outputPath = __dirname + '/..' + '/output.json';

removeCommonElements(file1Path, file2Path, outputPath);
