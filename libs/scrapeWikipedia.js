const axios = require('axios');
const cheerio = require('cheerio');
const { NlpManager } = require('node-nlp');


// Fungsi untuk melakukan web scraping dari Wikipedia
async function scrapeWikipedia(question) {
  const config = {
    headers: {
      'Authority': 'id.wikipedia.org',
      'Cookie': 'GeoIP=ID:JB:KelabangBiru:-5.76:107.39:v4; idwikimwuser-sessionId=fc80d68f759077d5deea; WMF-Last-Access=23-Jul-2023; WMF-Last-Access-Global=23-Jul-2023; NetworkProbeLimit=0.001; idwikiwmE-sessionTickLastTickTime=1690111043154; idwikiwmE-sessionTickTickCount=13',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    }
  };

  try {
    const wikipediaResponse = await axios.get(`https://id.wikipedia.org/w/api.php?action=opensearch&format=json&search=${question}`, config);
    const wikipediaContent = wikipediaResponse.data[3][0];
    console.log('Search', wikipediaContent);

    if (!wikipediaContent) {
      return { data: { error: 'Tidak ada jawaban yang sesuai.', code: 404, score: 0 } };
    }

    // Lakukan web scraping untuk mendapatkan isi artikel dari Wikipedia
    const articleResponse = await axios.get(wikipediaContent, config);
    const articleHtml = articleResponse.data;

    const $ = cheerio.load(articleHtml);

    // Mendapatkan semua paragraf dari artikel Wikipedia
    const paragraphs = [];
    $('p').each((index, element) => {
      const paragraphText = $(element).text().trim();
      console.log('article', paragraphText);
      if (paragraphText) {
        paragraphs.push(paragraphText);
      }
    });

    // Gabungkan paragraf menjadi satu teks
    const articleText = paragraphs.join(' ');
    const cleanedText = articleText.replace(/\{.*?\}/g, '').replace(/,\rseperti:.*?}/g, '');
    // Inisialisasi NlpManager dengan bahasa Indonesia
    const manager = new NlpManager({ languages: ['id'] });

    // Menambahkan teks dari Wikipedia ke NlpManager untuk analisis bahasa
    manager.addDocument('id', cleanedText, 'wikiText');

    // Menambahkan header dan footer untuk menyusun jawaban lebih relevan dan natural
    const headerText = "Berikut adalah beberapa informasi yang dapat saya temukan dari Wikipedia:\n";
    const footerText = "\n\nSumber: Wikipedia";

    // Melatih model untuk analisis bahasa
    await manager.train();

    // Melakukan analisis sentimen pada teks dari Wikipedia
    const response = await manager.process('id', cleanedText);
    const sentimentLabel = response.intent;

    // Jika hasil analisis sentimen adalah negatif, kembalikan pesan kesalahan
    if (sentimentLabel === 'negatif') {
      return { data: { error: 'Maaf, tidak ada jawaban yang sesuai untuk pertanyaan Anda.', code: 400, score: 0 } };
    }

    // Batasi banyaknya token (kata) dalam teks untuk menjaga respon tetap singkat
    const maxTokens = 1024; // Ubah jumlah maksimal token sesuai kebutuhan
    const tokenizedText = cleanedText.split(' ');
    let truncatedText = tokenizedText.slice(0, maxTokens).join(' ');

    // Cek apakah potongan terakhir berisi kalimat lengkap
    const lastPeriodIndex = truncatedText.lastIndexOf('.');
    if (lastPeriodIndex !== -1 && lastPeriodIndex >= truncatedText.length - 3) {
      // Jika potongan terakhir tidak lengkap, cari titik terakhir sebelum mencapai batas maksimal token
      truncatedText = truncatedText.slice(0, lastPeriodIndex + 1);
    }

    // Susun jawaban dengan header dan footer
    const fullAnswer = headerText + truncatedText + footerText;

    // Menggunakan NLP untuk menyempurnakan jawaban
    const nlpResponse = await manager.process('id', question);
    const nlpAnswer = nlpResponse.answer || "";

    // Gabungkan jawaban NLP dengan jawaban dari Wikipedia
    const finalAnswer = nlpAnswer + "\n\n" + fullAnswer;

    return { data: { answer: finalAnswer, code: 200, score: 1.0, note: 'wikipedia' } };
  } catch (error) {
    // Tangani kesalahan jika terjadi saat melakukan permintaan ke API Wikipedia atau web scraping
    console.error('Error saat melakukan permintaan ke API Wikipedia atau web scraping:', error.message);
    return { data: { error: 'Terjadi kesalahan saat mencari jawaban.', code: 500, score: 0 } };
  }
}


// Fungsi untuk melakukan pencarian di Google menggunakan Google Custom Search API
async function googleSearch(query) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    const html = response.data;

    // Menggunakan cheerio untuk parsing HTML
    const $ = cheerio.load(html);

    // Mengambil teks dari elemen dengan class "tF2Cxc"
    const text = $('.tF2Cxc').first().text();

    // Gabungkan paragraf menjadi satu teks
    const articleText = text.join(' ');
    const cleanedText = articleText.replace(/\{.*?\}/g, '').replace(/,\rseperti:.*?}/g, '');
    // Inisialisasi NlpManager dengan bahasa Indonesia
    const manager = new NlpManager({ languages: ['id'] });

    // Menambahkan teks dari Wikipedia ke NlpManager untuk analisis bahasa
    manager.addDocument('id', cleanedText, 'wikiText');

    // Menambahkan header dan footer untuk menyusun jawaban lebih relevan dan natural
    const headerText = "Berikut adalah beberapa informasi yang dapat saya temukan dari Google:\n";
    const footerText = "\n\nSumber: Google";

    // Melatih model untuk analisis bahasa
    await manager.train();

    // Melakukan analisis sentimen pada teks dari Wikipedia
    const responsex = await manager.process('id', cleanedText);
    const sentimentLabel = responsex.intent;

    // Jika hasil analisis sentimen adalah negatif, kembalikan pesan kesalahan
    if (sentimentLabel === 'negatif') {
      return { data: { error: 'Maaf, tidak ada jawaban yang sesuai untuk pertanyaan Anda.', code: 400, score: 0 } };
    }

    // Batasi banyaknya token (kata) dalam teks untuk menjaga respon tetap singkat
    const maxTokens = 1024; // Ubah jumlah maksimal token sesuai kebutuhan
    const tokenizedText = cleanedText.split(' ');
    let truncatedText = tokenizedText.slice(0, maxTokens).join(' ');

    // Cek apakah potongan terakhir berisi kalimat lengkap
    const lastPeriodIndex = truncatedText.lastIndexOf('.');
    if (lastPeriodIndex !== -1 && lastPeriodIndex >= truncatedText.length - 3) {
      // Jika potongan terakhir tidak lengkap, cari titik terakhir sebelum mencapai batas maksimal token
      truncatedText = truncatedText.slice(0, lastPeriodIndex + 1);
    }

    // Susun jawaban dengan header dan footer
    const fullAnswer = headerText + truncatedText + footerText;

    // Menggunakan NLP untuk menyempurnakan jawaban
    const nlpResponse = await manager.process('id', question);
    const nlpAnswer = nlpResponse.answer || "";

    // Gabungkan jawaban NLP dengan jawaban dari Wikipedia
    const finalAnswer = nlpAnswer + "\n\n" + fullAnswer;

    return { data: { answer: finalAnswer, code: 200, score: 1.0, note: 'google' } };
  } catch (error) {
    console.error('Error saat melakukan permintaan ke API Wikipedia, Google, atau web scraping:', error.message);
    return { data: { error: 'Terjadi kesalahan saat mencari jawaban.', code: 500, score: 0 } };
  }
}

module.exports = { scrapeWikipedia, googleSearch };
