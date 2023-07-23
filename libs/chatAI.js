const predictAnswerModule = require('./predictAnswer');
const analyzeSentiment = require('./analyzeSentiment');
const { scrapeWikipedia } = require('./scrapeWikipedia');
const chalk = require('chalk');

// Export beberapa fungsi untuk digunakan di server.js
module.exports = {
  getAnswer: async function (question) {
    // Melakukan prediksi jawaban dari model
    let answer = predictAnswerModule.predictAnswer(question); // Akses fungsi predictAnswer dari modul

    // Jika jawaban dari model adalah response error, lanjutkan dengan web scraping dari Wikipedia
    if (answer.data.code === 400) {
      console.log(chalk.cyan('[APP CHAT-AI]:'), chalk.green('Lakukan web scraping dari Wikipedia...'));
      answer = await processQuestion(question);

      // Jika tidak ada jawaban setelah scraping Wikipedia, kembalikan pesan kesalahan
      if (answer.data.code === 404) {
        return { status: false, data: { chat: 'Maaf, saya tidak bisa memberikan jawaban yang sesuai untuk pertanyaan Anda.', code: answer.data.code, score: 0, sentiment: '' } };
      }
    }

    // Lakukan analisis sentimen pada jawaban yang akan diberikan
    const sentiment = await analyzeSentiment(answer.data.answer);

    // Jika ada pesan kesalahan dari predictAnswer, kembalikan pesan kesalahan tersebut
    if (answer.data.code === 500 || answer.data.code === 403) {
      return { status: false, data: { chat: answer.data.error, code: answer.data.code, score: 0, sentiment } };
    }

    // Jika jawaban dari predictAnswer bukan string, kembalikan pesan kesalahan
    if (typeof answer.data.answer !== 'string') {
      console.log(answer.data.answer)
      return { status: false, data: { chat: 'Maaf, saya tidak bisa memberikan jawaban yang sesuai untuk pertanyaan Anda.', code: 200, score: 1.0, sentiment } };
    }


    // Jika hasil analisis sentimen adalah negatif, ganti jawaban dengan jawaban default
    if (sentiment === 'negatif') {
      answer = { status: true, data: { chat: 'Maaf, saya tidak bisa memberikan jawaban yang sesuai untuk pertanyaan Anda.', code: 200, score: 0.0, sentiment } };
    }

    return { status: true, data: { chat: answer.data.answer, code: answer.data.code, score: answer.data.score, sentiment: sentiment } };
  }
};

async function processQuestion(question) {
  try {
    // Lakukan web scraping untuk mendapatkan jawaban dari Wikipedia
    const scrapedData = await scrapeWikipedia(question);

    // Tambahkan data hasil web scraping ke dataset training
    if (scrapedData && scrapedData.data.answer) {
      predictAnswerModule.addDataToTrainingSet(question, scrapedData.data.answer, 'positif');
    }

    // Kembalikan hasil web scraping
    return { status: true, data: { answer: scrapedData.data.answer, code: 200, score: 1.0, sentiment: 'positif' } };
  } catch (error) {
    console.error('Error while processing question:', error.message);
    return { data: { error: 'Terjadi kesalahan saat melakukan web scraping.', code: 500, score: 0 } };
  }
}
