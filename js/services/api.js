/*
   SITTA Vue   services/api.js
   Lapisan akses data: mengambil JSON dan file template lewat fetch,
   lalu merapikan bentuk data agar mudah dipakai komponen.
   Catatan: fetch tidak jalan lewat file://   buka dengan web server lokal.
 */
var Api = (function () {
  var URL_DATA = "data/dataBahanAjar.json";

  /* nama berkas di /templates/  ->  id <template> (konsisten: tpl-...) */
  var DAFTAR_TEMPLATE = {
    "stock-table": "tpl-stock",
    "stock-form": "tpl-stock-form",
    "do-tracking": "tpl-tracking",
    "order-form": "tpl-order",
    "status-badge": "tpl-badge",
    "app-modal": "tpl-modal"
  };

  function ambil(url, jenis) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("Gagal memuat " + url + " (HTTP " + res.status + ").");
      return jenis === "json" ? res.json() : res.text();
    });
  }

  /* Data tracking pada JSON berbentuk array berisi objek satu kunci
     [ { "DO2025-0001": {...} }, ... ] dan bisa mengandung nomor ganda.
     Diubah menjadi array datar [{ nomor, nim, ... }] tanpa duplikat. */
  function ratakanTracking(mentah) {
    var hasil = [];
    var sudah = {};
    var daftar = Array.isArray(mentah) ? mentah : [mentah || {}];
    daftar.forEach(function (objek) {
      Object.keys(objek).forEach(function (nomor) {
        if (sudah[nomor]) return;
        sudah[nomor] = true;
        var d = objek[nomor];
        hasil.push(Object.assign({}, d, {
          nomor: nomor,
          perjalanan: Array.isArray(d.perjalanan) ? d.perjalanan.slice() : []
        }));
      });
    });
    return hasil;
  }

  function muatData() {
    return ambil(URL_DATA, "json").then(function (json) {
      return {
        upbjjList: json.upbjjList || [],
        kategoriList: json.kategoriList || [],
        pengirimanList: json.pengirimanList || [],
        paket: json.paket || [],
        stok: json.stok || [],
        tracking: ratakanTracking(json.tracking)
      };
    });
  }

  /* Memuat templates/*.html dan menyisipkannya sebagai <template id="tpl-...">
     agar bisa dirujuk komponen lewat  template: "#tpl-..." */
  function muatTemplate() {
    var tugas = Object.keys(DAFTAR_TEMPLATE).map(function (nama) {
      var id = DAFTAR_TEMPLATE[nama];
      if (document.getElementById(id)) return Promise.resolve();
      return ambil("templates/" + nama + ".html", "text").then(function (html) {
        var el = document.createElement("template");
        el.id = id;
        el.innerHTML = html;
        document.body.appendChild(el);
      });
    });
    return Promise.all(tugas);
  }

  function muatSemua() {
    return Promise.all([muatData(), muatTemplate()]).then(function (hasil) {
      return hasil[0];
    });
  }

  return { muatData: muatData, muatTemplate: muatTemplate, muatSemua: muatSemua, ratakanTracking: ratakanTracking };
})();
