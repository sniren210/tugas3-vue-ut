/* <do-tracking>   pencarian DO (nomor / NIM), detail perjalanan, tambah progress.
   Props : data (array DO), paket (untuk nama paket), fokusNomor (DO yang baru dibuat)
   Event : progress { nomor, keterangan, status }
   Keyboard: Enter = cari, Esc = reset pencarian, Enter di kolom progress = tambah. */
Vue.component("do-tracking", {
  template: "#tpl-tracking",
  props: {
    data: { type: Array, required: true },
    paket: { type: Array, default: function () { return []; } },
    fokusNomor: { type: String, default: "" }
  },
  data: function () {
    return {
      langkahStatus: ["Diproses", "Dalam Perjalanan", "Selesai"],
      modus: "nomor", /* "nomor" | "nim" */
      kata: "",
      terapkan: "", /* kata yang sudah di-submit */
      sudahCari: false,
      galat: "",
      dipilih: "",
      progress: { keterangan: "", status: "Diproses" },
      galatProgress: ""
    };
  },

  computed: {
    semuaDO: function () {
      return this.data.slice().sort(function (a, b) { return a.nomor < b.nomor ? 1 : -1; });
    },
    hasil: function () {
      var q = this.terapkan.toUpperCase();
      var kunci = this.modus === "nomor" ? "nomor" : "nim";
      return this.semuaDO.filter(function (d) { return String(d[kunci]).toUpperCase().indexOf(q) !== -1; });
    },
    daftarTampil: function () {
      return this.sudahCari ? this.hasil : this.semuaDO;
    },
    detailDO: function () {
      var nomor = this.dipilih;
      return this.data.find(function (d) { return d.nomor === nomor; }) || null;
    },
    indeksStatus: function () {
      return this.detailDO ? this.langkahStatus.indexOf(this.detailDO.status) : -1;
    },
    perjalananTerbaru: function () {
      return this.detailDO ? this.detailDO.perjalanan.slice().reverse() : [];
    }
  },

  watch: {
    /* 1) Ganti mode pencarian => kosongkan kolom, galat, dan hasil */
    modus: function () {
      this.reset();
    },
    /* 2) Mengetik ulang => pesan galat lama dihapus */
    kata: function () {
      this.galat = "";
    },
    /* 3) DO baru dibuat dari form => langsung dibuka detailnya */
    fokusNomor: function (nomor) {
      if (!nomor) return;
      this.reset();
      this.lihat(nomor);
    },
    /* 4) Ganti DO terpilih => pilihan status mengikuti status DO itu */
    detailDO: function (d) {
      if (d) this.progress.status = d.status;
      this.progress.keterangan = "";
      this.galatProgress = "";
    }
  },

  methods: {
    namaPaket: function (kode) {
      var p = this.paket.find(function (x) { return x.kode === kode; });
      return p ? kode + "   " + p.nama : kode;
    },

    /* Enter */
    cari: function () {
      var q = this.kata.trim();
      if (!q) {
        this.galat = this.modus === "nomor" ? "Masukkan nomor DO yang dicari." : "Masukkan NIM yang dicari.";
        return;
      }
      if (this.modus === "nim" && !/^\d+$/.test(q)) {
        this.galat = "NIM hanya berisi angka.";
        return;
      }
      this.galat = "";
      this.terapkan = q;
      this.sudahCari = true;
      this.dipilih = this.hasil.length === 1 ? this.hasil[0].nomor : "";
    },

    /* Esc */
    reset: function () {
      this.kata = "";
      this.terapkan = "";
      this.sudahCari = false;
      this.galat = "";
      this.dipilih = "";
      var kolom = this.$refs.kolomCari;
      if (kolom && kolom.focus) kolom.focus();
    },

    lihat: function (nomor) {
      this.dipilih = nomor;
      this.$nextTick(function () {
        var el = document.getElementById("detail-do");
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },

    tambahProgress: function () {
      if (!this.detailDO) return;
      var ket = this.progress.keterangan.trim();
      if (ket.length < 3) {
        this.galatProgress = "Keterangan minimal 3 karakter.";
        return;
      }
      this.galatProgress = "";
      this.$emit("progress", { nomor: this.detailDO.nomor, keterangan: ket, status: this.progress.status });
      this.progress.keterangan = "";
    }
  }
});
