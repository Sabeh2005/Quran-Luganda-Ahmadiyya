const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public/data/quran_arabic.json');
try {
    const data = fs.readFileSync(filePath, 'utf8');
    const verses = JSON.parse(data);
    const verse = verses.find(v => v.surah_number === 11 && v.ayah_number === 32);
    if (verse) {
        console.log(JSON.stringify(verse, null, 2));
        console.log("Verse Text Code Points:");
        const text = verse.text_content;
        for (let i = 0; i < text.length; i++) {
            console.log(`${text[i]} (U+${text.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0')})`);
        }
    } else {
        console.log("Verse not found");
    }
} catch (err) {
    console.error("Error:", err);
}
