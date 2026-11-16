/* SITTA Vue — utils.js
   Fungsi bantu murni (tanpa Vue) yang dipakai beberapa komponen.
   Dimuat sebelum filters.js dan semua komponen.
   */
var Utils = (function () {
  function dua(n) { return (n < 10 ? "0" : "") + n; }

  /* Tanggal lokal perangkat, format yyyy-mm-dd (bukan toISOString yang memakai UTC) */
  function tanggalHariIni() {
    var d = new Date();
    return d.getFullYear() + "-" + dua(d.getMonth() + 1) + "-" + dua(d.getDate());
  }

  /* Waktu lokal perangkat, format yyyy-mm-dd hh:mm:ss (sama dengan data perjalanan) */
  function waktuSekarang() {
    var d = new Date();
    return tanggalHariIni() + " " + dua(d.getHours()) + ":" + dua(d.getMinutes()) + ":" + dua(d.getSeconds());
  }

  /* Catatan ditampilkan dengan v-html: hanya tag sederhana yang diizinkan,
     tag lain di-escape agar tidak ada script yang bisa jalan. */
  function bersihkanCatatan(teks) {
    var aman = String(teks || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return aman
      .replace(/&lt;(\/?)(em|strong|i|b|u)&gt;/gi, "<$1$2>")
      .replace(/&lt;br\s*\/?&gt;/gi, "<br>");
  }

  /* "123" -> 123, selain bilangan bulat tak negatif -> NaN */
  function angkaBulat(nilai) {
    var t = String(nilai).trim();
    return /^\d+$/.test(t) ? Number(t) : NaN;
  }

  return {
    tanggalHariIni: tanggalHariIni,
    waktuSekarang: waktuSekarang,
    bersihkanCatatan: bersihkanCatatan,
    angkaBulat: angkaBulat,
    dua: dua
  };
})();
