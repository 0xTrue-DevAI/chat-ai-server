const { NlpManager } = require('node-nlp');
const { NormalizerId, StopwordsId } = require('@nlpjs/lang-id');
const { NormalizerEn, StopwordsEn } = require('@nlpjs/lang-en');

// Fungsi untuk membersihkan teks (mengubah ke huruf kecil)
function cleanText(text) {
  console.log(text)
  if (!text) { }
  const textString = text;
  if (!textString) {
    return '';
  }
  const normalizer = new NormalizerId();
  return normalizer.normalize(textString);
}

// Fungsi untuk melakukan analisis sentimen teks
async function analyzeSentiment(text) {
  // Membersihkan teks
  const cleanedText = cleanText(text);

  // Pastikan teks yang diberikan adalah string
  if (typeof cleanedText !== 'string') {
    throw new Error('Input harus berupa string.');
  }

  // Membuat instance dari NlpManager dengan bahasa Indonesia (id)
  const manager = new NlpManager({ languages: ['id'] });

  // Menambahkan data training untuk analisis sentimen
  manager.addDocument('id', cleanedText, 'sentiment');

  // Melatih model untuk analisis sentimen
  await manager.train();

  // Memperoleh hasil analisis sentimen
  const response = await manager.process('id', cleanedText);
  const sentimentLabel = response.intent;

  // Cek apakah teks dalam bahasa Inggris
  const stopwordsId = new StopwordsId();
  if (!stopwordsId.isStopword(cleanedText)) {
    // Jika teks bukan dalam bahasa Indonesia, alihkan ke bahasa Inggris
    const normalizerEn = new NormalizerEn();
    const managerEn = new NlpManager({ languages: ['en'] });
    managerEn.addDocument('en', normalizerEn.normalize(cleanedText), 'sentiment');
    await managerEn.train();
    const responseEn = await managerEn.process('en', normalizerEn.normalize(cleanedText));
    return responseEn.intent;
  }

  return sentimentLabel;
}

module.exports = analyzeSentiment;
