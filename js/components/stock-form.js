/* <ba-stock-form> — formulir tambah (create) dan ubah (update) stok.
   Props : mode ("baru" | "edit"), nilai (data awal), items (untuk cek kode ganda),
           kategoriList, upbjjList
   Event : simpan (data siap pakai), batal
   Keyboard: Enter di kolom isian langsung menyimpan. */
Vue.component("ba-stock-form", {
  template: "#tpl-stock-form",
  props: {
    mode: { type: String, default: "baru" },
    nilai: { type: Object, required: true },
    items: { type: Array, default: function () { return []; } },
    kategoriList: { type: Array, default: function () { return []; } },
    upbjjList: { type: Array, default: function () { return []; } }
  },
  data: function () {
    return {
      form: Object.assign({}, this.nilai), /* salinan lokal: batal tidak mengubah data asli */
      sudahCoba: false,
      disentuh: {}
    };
  },
  computed: {
    galat: function () {
      var f = this.form;
      var g = {};
      var kode = String(f.kode || "").trim();

      if (this.mode === "baru") {
        if (!kode) g.kode = "Kode wajib diisi.";
        else if (!/^[A-Z]{3,6}\d{4}$/.test(kode)) g.kode = "Format kode: 3–6 huruf besar + 4 angka, contoh EKMA4116.";
        else if (this.items.some(function (s) { return s.kode === kode; })) g.kode = "Kode ini sudah ada di daftar stok.";
      }
      if (String(f.judul || "").trim().length < 3) g.judul = "Judul minimal 3 karakter.";
      if (!f.kategori) g.kategori = "Pilih kategori mata kuliah.";
      if (!f.upbjj) g.upbjj = "Pilih UT-Daerah.";
      if (!/^R\d{1,2}-[A-Z]\d{1,2}$/.test(String(f.lokasiRak || "").trim().toUpperCase())) g.lokasiRak = "Format lokasi rak: R1-A3.";

      var harga = Utils.angkaBulat(f.harga);
      if (isNaN(harga) || harga < 1000 || harga > 10000000) g.harga = "Harga berupa angka bulat 1.000 – 10.000.000.";
      var qty = Utils.angkaBulat(f.qty);
      if (isNaN(qty) || qty > 100000) g.qty = "Stok berupa angka bulat 0 – 100.000.";
      var safety = Utils.angkaBulat(f.safety);
      if (isNaN(safety) || safety > 100000) g.safety = "Safety stock berupa angka bulat 0 – 100.000.";
      if (String(f.catatanHTML || "").length > 200) g.catatanHTML = "Catatan maksimal 200 karakter.";
      return g;
    },
    valid: function () {
      return Object.keys(this.galat).length === 0;
    },
    hargaAngka: function () {
      var h = Utils.angkaBulat(this.form.harga);
      return isNaN(h) ? 0 : h;
    },
    pratinjau: function () {
      return Utils.bersihkanCatatan(this.form.catatanHTML);
    }
  },
  watch: {
    /* kode barang otomatis huruf besar tanpa spasi saat diketik */
    "form.kode": function (nilai) {
      var rapi = String(nilai).toUpperCase().replace(/\s+/g, "");
      if (rapi !== nilai) this.form.kode = rapi;
    }
  },
  methods: {
    id: function (nama) { return "sf-" + this._uid + "-" + nama; },
    sentuh: function (field) { this.$set(this.disentuh, field, true); },
    tampilGalat: function (field) {
      return (this.sudahCoba || this.disentuh[field]) ? this.galat[field] : "";
    },

    /* Enter di kolom isian = simpan. Di textarea (baris baru) dan di tombol
       (Enter = klik tombol itu) perilaku bawaan dibiarkan. */
    tekanEnter: function (e) {
      var tag = e.target.tagName;
      if (tag === "TEXTAREA" || tag === "BUTTON") return;
      e.preventDefault();
      this.simpan();
    },

    simpan: function () {
      this.sudahCoba = true;
      if (!this.valid) return;
      var f = this.form;
      this.$emit("simpan", {
        kode: f.kode.trim(),
        judul: f.judul.trim(),
        kategori: f.kategori,
        upbjj: f.upbjj,
        lokasiRak: f.lokasiRak.trim().toUpperCase(),
        harga: Number(f.harga),
        qty: Number(f.qty),
        safety: Number(f.safety),
        catatanHTML: Utils.bersihkanCatatan(String(f.catatanHTML || "").trim())
      });
    }
  }
});
