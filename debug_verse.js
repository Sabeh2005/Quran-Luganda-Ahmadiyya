const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public/data/quran_arabic.json');
try {
    const data = fs.readFileSync(filePath, 'utf8');
    const verses = JSON.parse(data);
    const verse = verses.find(v => v.surah_number === 24 && v.ayah_number === 36);
    if (verse) {
        console.log(JSON.stringify(verse, null, 2));
        console.log("Verse Text Code Points:");
        for (let i = 0; i < verse.text_content.length; i++) {
            console.log(`${verse.text_content[i]} (U+${verse.text_content.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0')})`);
        }
    } else {
        console.log("Verse not found");
    }
} catch (err) {
    console.error("Error:", err);
}
