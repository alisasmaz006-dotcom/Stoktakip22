const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        if (file.includes('node_modules') || file.includes('.git') || file.includes('dist')) return;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('Math.random')) {
                results.push(file);
            }
        }
    });
    return results;
}
console.log(walk('C:\\Users\\Acer\\Desktop\\s2g').map(f => f.split('s2g')[1]));
