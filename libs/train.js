const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
const fs = require('fs');
const chalk = require('chalk');

// Data latih untuk chat AI (Contoh data sederhana)
const trainingData = [
    { input: 'Halo', output: 'Halo juga!', sentiment: 'positif' },
    { input: 'Bagaimana kabar?', output: 'Kabar saya baik, terima kasih!', sentiment: 'positif' },
    { input: 'Siapa nama Anda?', output: 'Nama saya adalah ChatBot.', sentiment: 'netral' },
    // Tambahkan lebih banyak data latih dengan pertanyaan, jawaban, dan sentimen yang sesuai di sini
];

// Fungsi untuk membuat model chat AI sederhana
function createChatModel() {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 128, inputShape: [1], activation: 'relu' }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
    return model;
}

// Pre-processing data latih
const inputData = tf.tensor(trainingData.map(item => item.input));
const outputData = tf.tensor(trainingData.map(item => item.output));

// Membuat model chat AI
const chatModel = createChatModel();

// Melatih model
async function trainModel() {
    await chatModel.fit(inputData, outputData, { epochs: 100 });
    console.log('Pelatihan model selesai.');

    // Simpan model ke dalam file
    const modelSavePath = '../model/model.json';
    await chatModel.save(`file://${modelSavePath}`);
    console.log(`Model disimpan dalam file "${modelSavePath}"`);
}

trainModel();
