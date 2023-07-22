## Chat AI menggunakan TensorFlow.js dan NLP

Selamat datang di dokumentasi untuk Chat AI berbasis TensorFlow.js dan NLP, express! Dalam proyek ini, kami akan membuat sebuah aplikasi chat AI yang dapat memberikan jawaban berdasarkan pertanyaan yang diberikan. Aplikasi ini menggunakan TensorFlow.js untuk model AI dan library Natural untuk analisis sentimen.

### Cara Penggunaan

1. **Training Model (Opsional)**

   Sebelum menggunakan Chat AI, Anda dapat melakukan proses training model untuk mempersiapkan model yang sesuai dengan kebutuhan Anda. Proses training ini dilakukan dengan menjalankan `train.js`.

   ```bash
   node train.js
   ```

2. **Menjalankan Server API**

   Untuk menjalankan server API yang menghosting Chat AI, jalankan perintah berikut:

   ```bash
   node server.js
   ```

   Server API akan berjalan di `http://localhost:3000`.

3. **Mendapatkan Token JWT**

   Sebelum mengakses endpoint `/api/chat`, Anda perlu mendapatkan token JWT terlebih dahulu. Lakukan permintaan POST ke `/api/token` dengan data berikut:

   ```json
   {
     "username": "nama_pengguna",
     "password": "kata_sandi"
   }
   ```

   Anda akan menerima token JWT sebagai respons.

4. **Berkomunikasi dengan Chat AI**

   Anda dapat berkomunikasi dengan Chat AI dengan menggunakan token JWT yang telah diberikan. Lakukan permintaan POST ke `/api/chat` dengan mengirimkan teks pertanyaan sebagai data.

   ```json
   {
     "question": "Halo, apa kabar?"
   }
   ```

   Anda akan menerima respons dari Chat AI dalam bentuk teks jawaban.

### Fitur dan Kustomisasi

Dalam skrip `server.js`, Anda dapat melakukan kustomisasi lebih lanjut untuk mengatur respons dari Chat AI berdasarkan kebutuhan Anda. Misalnya, Anda dapat menambahkan lebih banyak data latih pada `trainingData` untuk meningkatkan akurasi dan variasi jawaban dari model.

Selain itu, Anda juga dapat menyesuaikan parameter seperti threshold untuk analisis sentimen dan lainnya agar Chat AI berperilaku sesuai dengan preferensi Anda.

### Struktur Proyek

```
- ./libs/chatAI.js
- ./libs/predictAnswer.js
- ./libs/server.js
- ./libs/scrapeWikipedia.js
- server.js
- model/
  - model.json
  - group1-shard1of1.bin
- package.json
- README.md
```

- `chatAI.js`: Fungsi-fungsi untuk prediksi jawaban, analisis sentimen, dan web scraping Wikipedia.
- `predictAnswer.js`: Fungsi-fungsi untuk prediksi jawaban, analisis sentimen.
- `train.js`: Skrip untuk proses training model (opsional).
- `server.js`: Skrip untuk menjalankan server API.
- `scrapeWikipedia.js`: Fungsi untuk web scraping Wikipedia.
- `model/`: Folder untuk menyimpan model AI (file model.json dan group1-shard1of1.bin).
- `package.json`: Daftar dependensi dan skrip yang dibutuhkan untuk proyek.
- `README.md`: Dokumentasi dan panduan penggunaan proyek ini.

### Kesimpulan

Dokumentasi ini telah memberikan panduan tentang cara menggunakan Chat AI berbasis TensorFlow.js dan NLP. Dengan mengikuti langkah-langkah yang telah dijelaskan, Anda dapat dengan mudah mengakses dan berinteraksi dengan Chat AI melalui server API yang telah disediakan.

Selamat mencoba dan semoga berhasil! Jangan ragu untuk menghubungi kami jika Anda memiliki pertanyaan lebih lanjut. Terima kasih telah menggunakan Chat AI kami!
