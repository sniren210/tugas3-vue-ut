/* <order-form>   formulir Delivery Order baru.
   Props : paket, ekspedisi (pengirimanList), stok (judul & harga isi paket), nomorDo (otomatis dari induk)
   Event : created (objek DO baru)
   Keyboard: Enter di kolom isian = simpan. */
Vue.component("order-form", {
  template: "#tpl-order",
  props: {
    paket: { type: Array, default: function () { return []; } },
    ekspedisi: { type: Array, default: function () { return []; } },
    stok: { type: Array, default: function () { return []; } },
    nomorDo: { type: String, required: true }
  },
  data: function () {
    return {
      form: this.formKosong(),
      sudahCoba: false,
      disentuh: {}
    };
  },

  computed: {
    paketTerpilih: function () {
      var kode = this.form.paket;
      return this.paket.find(function (p) { return p.kode === kode; }) || null;
    },
    /* isi paket (kode) dipetakan ke judul & harga di data stok */
    isiPaket: function () {
      if (!this.paketTerpilih) return [];
      var stok = this.stok;
      return this.paketTerpilih.isi.map(function (kode) {
        var s = stok.find(function (x) { return x.kode === kode; });
        return s || { kode: kode, judul: "(data stok tidak ditemukan)", harga: null };
      });
    },
    galat: function () {
      var f = this.form;
      var g = {};
      if (!/^\d{9}$/.test(f.nim)) g.nim = "NIM berupa 9 digit angka.";
      if (!/^[A-Za-z][A-Za-z .'-]{2,}$/.test(f.nama.trim())) g.nama = "Nama minimal 3 huruf (huruf, spasi, titik, apostrof, atau strip).";
      if (!f.ekspedisi) g.ekspedisi = "Pilih jenis pengiriman.";
      if (!f.paket) g.paket = "Pilih paket bahan ajar.";
      var thn = Number(String(f.tanggalKirim).slice(0, 4));
      if (!/^\d{4}-\d{2}-\d{2}$/.test(f.tanggalKirim) || isNaN(new Date(f.tanggalKirim).getTime())) g.tanggalKirim = "Isi tanggal kirim yang valid.";
      else if (thn < 2020 || thn > 2100) g.tanggalKirim = "Tahun tanggal kirim harus antara 2020 dan 2100.";
      return g;
    },
    valid: function () {
      return Object.keys(this.galat).length === 0;
    }
  },

  watch: {
    /* 1) Pilih paket => total harga mengikuti harga paket */
    "form.paket": function (kode) {
      var p = this.paket.find(function (x) { return x.kode === kode; });
      this.form.total = p ? p.harga : 0;
    },
    /* 2) NIM hanya menerima angka (huruf langsung dibuang), maksimal 9 digit */
    "form.nim": function (nilai) {
      var angka = String(nilai).replace(/\D/g, "").slice(0, 9);
      if (angka !== nilai) this.form.nim = angka;
    }
  },

  methods: {
    formKosong: function () {
      return { nim: "", nama: "", ekspedisi: "", paket: "", tanggalKirim: Utils.tanggalHariIni(), total: 0 };
    },
    sentuh: function (field) { this.$set(this.disentuh, field, true); },
    tampilGalat: function (field) {
      return (this.sudahCoba || this.disentuh[field]) ? this.galat[field] : "";
    },
    isiHariIni: function () {
      this.form.tanggalKirim = Utils.tanggalHariIni();
    },
    tekanEnter: function (e) {
      var tag = e.target.tagName;
      if (tag === "BUTTON") return;
      e.preventDefault();
      this.simpan();
    },

    simpan: function () {
      this.sudahCoba = true;
      if (!this.valid) return;

      var f = this.form;
      var eks = this.ekspedisi.find(function (p) { return p.kode === f.ekspedisi; });
      this.$emit("created", {
        nomor: this.nomorDo,
        nim: f.nim,
        nama: f.nama.trim(),
        status: "Diproses",
        ekspedisi: "JNE " + (eks ? eks.nama : f.ekspedisi),
        tanggalKirim: f.tanggalKirim,
        paket: f.paket,
        total: f.total,
        perjalanan: [{ waktu: Utils.waktuSekarang(), keterangan: "Delivery Order dibuat" }]
      });

      this.form = this.formKosong();
      this.sudahCoba = false;
      this.disentuh = {};
    }
  }
});
