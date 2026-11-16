/*
   SITTA Vue — filters.js
   Filter Vue 2 untuk memformat teks di template: {{ nilai | namaFilter }}
   Didaftarkan global sebelum komponen dibuat.

/* 65000 -> "Rp 65.000" */
Vue.filter("rupiah", function (nilai) {
  return "Rp " + Number(nilai).toLocaleString("id-ID");
});

/* 28 -> "28 buah" */
Vue.filter("buah", function (nilai) {
  return Number(nilai).toLocaleString("id-ID") + " buah";
});

/* "2025-08-25" -> "25 Agustus 2025" */
Vue.filter("tanggalPanjang", function (iso) {
  if (!iso) return "-";
  var d = new Date(String(iso).length <= 10 ? iso + "T00:00:00" : String(iso).replace(" ", "T"));
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
});

/* "2025-08-25 10:12:20" -> "25 Agu 2025, 10:12" */
Vue.filter("waktuPendek", function (teks) {
  var d = new Date(String(teks).replace(" ", "T"));
  if (isNaN(d.getTime())) return "-";
  var tgl = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  return tgl + ", " + Utils.dua(d.getHours()) + ":" + Utils.dua(d.getMinutes());
});
