const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
const chalk = require('chalk');

// Data latih untuk chat AI (Contoh data sederhana)
const trainingData = [
  { input: 'Halo', output: 'Halo juga!', sentiment: 'positif' },
  { input: 'Hai', output: 'Hai!', sentiment: 'positif' },
  { input: 'Selamat pagi', output: 'Selamat pagi!', sentiment: 'positif' },
  { input: 'Bagaimana kabar?', output: 'Kabar saya baik, terima kasih!', sentiment: 'positif' },
  { input: 'Apa kabar?', output: 'Saya baik-baik saja, terima kasih!', sentiment: 'positif' },
  { input: 'Siapa nama Anda?', output: 'Nama saya adalah ChatBot.', sentiment: 'netral' },
  { input: 'Boleh kenalan?', output: 'Tentu, nama saya ChatBot.', sentiment: 'netral' },
  { input: 'Sudah makan?', output: 'Belum, saya adalah program komputer.', sentiment: 'netral' },
  { input: 'Kamu bodoh', output: 'Mohon maaf jika saya membuat kesalahan.', sentiment: 'negatif' },
  { input: 'Kamu hebat!', output: 'Terima kasih! Saya berusaha memberikan yang terbaik.', sentiment: 'positif' },
  { input: 'Apakah kamu bisa berhitung?', output: 'Ya, saya bisa melakukan perhitungan matematika sederhana.', sentiment: 'positif' },
  { input: 'Bisakah kamu membantu saya mencari informasi?', output: 'Tentu, saya akan berusaha membantu Anda.', sentiment: 'positif' },
  { input: 'Sampai jumpa', output: 'Sampai jumpa! Semoga harimu menyenangkan.', sentiment: 'positif' },
  // Tambahkan lebih banyak data latih dengan pertanyaan, jawaban, dan sentimen yang sesuai di sini
];

/// Fungsi untuk menambahkan data ke dataset trainingData
function addDataToTrainingSet(input, scrapedAnswer, sentiment) {
  // Validasi input dan scrapedAnswer tidak boleh kosong
  if (!input || !scrapedAnswer) {
    console.error(chalk.red('[ERROR]:'), 'Input dan jawaban dari hasil scraped tidak boleh kosong.');
    return;
  }

  // Pastikan sentimen valid (positif, netral, atau negatif)
  const validSentiments = ['positif', 'netral', 'negatif'];
  if (!validSentiments.includes(sentiment)) {
    console.error(chalk.red('[ERROR]:'), 'Sentimen harus salah satu dari: positif, netral, atau negatif.');
    return;
  }

  // Tambahkan data ke dataset trainingData
  trainingData.push({ input, output: scrapedAnswer, sentiment });
}

/// Membuat model chat AI
const chatModel = tf.sequential();
chatModel.add(tf.layers.dense({ units: 128, inputShape: [1], activation: 'relu' }));
chatModel.add(tf.layers.dense({ units: 64, activation: 'relu' }));
chatModel.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
chatModel.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

// Fungsi untuk melakukan prediksi dengan model chat AI
function predictAnswer(question) {
  if (!question) {
    // Atau berikan pesan kesalahan jika diperlukan
    return { data: { error: 'Pertanyaan tidak boleh kosong!', code: 403, score: 0 } };
  }

  // Jika pertanyaan sudah ada dalam data latih, langsung kembalikan jawaban yang sesuai
  const data = trainingData.find(item => item.input && item.input.toLowerCase() === question.toLowerCase());
  if (data) {
    return { data: { answer: data.output, code: 200, score: 1.0 } };
  }

  // Jika tidak ada jawaban yang sesuai dalam data latih, cari kata yang mendekati
  let closestMatch = '';
  let closestScore = 0;
  trainingData.forEach(item => {
    const inputWords = item.input.toLowerCase().split(' ');
    const questionWords = question.toLowerCase().split(' ');

    // Hitung skor kesamaan antara kata dalam pertanyaan dan kata dalam data latih
    let score = 0;
    inputWords.forEach(word => {
      if (questionWords.includes(word)) {
        score++;
      }
    });

    // Jika skor kesamaan lebih tinggi daripada skor terdekat sebelumnya, perbarui nilai skor dan jawaban terdekat
    if (score > closestScore) {
      closestScore = score;
      closestMatch = item.output;
    }
  });

  // Jika skor kesamaan lebih tinggi daripada nilai ambang batas, kembalikan jawaban terdekat
  if (closestScore > 0) {
    console.log(chalk.cyan('[APP CHAT-AI]:'), chalk.green('Jawaban mendekati data latih...'));
    return { data: { answer: closestMatch, score: closestScore / closestMatch.split(' ').length, code: 200, score: closestScore } };
  }

  // Jika tidak ada jawaban yang mendekati dalam data latih, gunakan model untuk prediksi
  const input = tf.tensor([0]); // Ubah 0 dengan angka sesuai dengan data yang ingin diprediksi
  const result = chatModel.predict(input).arraySync()[0][0];

  if (result > 0.8) {
    console.log(chalk.cyan('[APP CHAT-AI]:'), chalk.green('Gunakan model untuk prediksi...'));
    const predictedAnswerIndex = result.indexOf(Math.max(...result)); // Cari index jawaban dengan probabilitas tertinggi
    const predictedAnswer = trainingData[predictedAnswerIndex].output;
    return { data: { answer: predictedAnswer, score: result } };
  }

  // Atau berikan pesan kesalahan jika diperlukan
  return { data: { error: 'Dari Predict Tidak ada jawaban yang sesuai.', code: 400, score: 0 } };
}

module.exports = { predictAnswer, addDataToTrainingSet };
