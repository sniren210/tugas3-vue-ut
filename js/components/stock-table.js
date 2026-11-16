/* <ba-stock-table> — daftar stok + filter/sort + tambah, ubah, hapus.
   Props : items (daftar stok), upbjjList, kategoriList
   Event : simpan {mode, data}, hapus kode
   Data tidak diubah di sini; perubahan dikirim ke induk lewat event (one-way data flow). */
Vue.component("ba-stock-table", {
  template: "#tpl-stock",
  props: {
    items: { type: Array, required: true },
    upbjjList: { type: Array, default: function () { return []; } },
    kategoriList: { type: Array, default: function () { return []; } }
  },
  data: function () {
    return {
      filter: { upbjj: "", kategori: "", status: "semua", kata: "" },
      urut: { kunci: "judul", arah: "asc" },
      tooltipKode: "",
      formTampil: false,
      modeForm: "baru", /* "baru" | "edit" */
      formData: {},
      hapusItem: null
    };
  },

  /* Computed di-cache: hasil filter/sort hanya dihitung ulang bila
     data yang dibacanya berubah, bukan setiap render. */
  computed: {
    adaFilterAktif: function () {
      var f = this.filter;
      return Boolean(f.upbjj || f.kategori || f.status !== "semua" || f.kata ||
        this.urut.kunci !== "judul" || this.urut.arah !== "asc");
    },

    /* jumlah judul per kategori pada UT-Daerah terpilih (filter dependen) */
    jumlahPerKategori: function () {
      var hitung = {};
      var upbjj = this.filter.upbjj;
      this.items.forEach(function (s) {
        if (s.upbjj === upbjj) hitung[s.kategori] = (hitung[s.kategori] || 0) + 1;
      });
      return hitung;
    },

    /* objek { UT-Daerah: total stok } — dirender dengan v-for (nilai, kunci) */
    totalPerDaerah: function () {
      var total = {};
      this.upbjjList.forEach(function (u) { total[u] = 0; });
      this.items.forEach(function (s) {
        total[s.upbjj] = (total[s.upbjj] || 0) + s.qty;
      });
      return total;
    },

    tersaring: function () {
      var f = this.filter;
      var kata = f.kata.trim().toLowerCase();
      var self = this;
      return this.items.filter(function (s) {
        if (f.upbjj && s.upbjj !== f.upbjj) return false;
        if (f.kategori && s.kategori !== f.kategori) return false;
        var st = self.statusStok(s);
        if (f.status === "reorder" && st === "aman") return false;
        if (f.status === "menipis" && st !== "menipis") return false;
        if (f.status === "kosong" && st !== "kosong") return false;
        if (kata && (s.kode + " " + s.judul).toLowerCase().indexOf(kata) === -1) return false;
        return true;
      });
    },

    tampil: function () {
      var kunci = this.urut.kunci;
      var arah = this.urut.arah === "asc" ? 1 : -1;
      return this.tersaring.slice().sort(function (a, b) {
        if (kunci === "judul") return arah * a.judul.localeCompare(b.judul, "id");
        return arah * (a[kunci] - b[kunci]);
      });
    },

    jumlahReorder: function () {
      return this.items.filter(function (s) { return s.qty < s.safety; }).length;
    },
    jumlahKosong: function () {
      return this.items.filter(function (s) { return s.qty === 0; }).length;
    },
    totalEksemplar: function () {
      return this.items.reduce(function (jml, s) { return jml + s.qty; }, 0);
    }
  },

  watch: {
    /* 1) Filter dependen: ganti UT-Daerah => kategori lama tidak berlaku lagi */
    "filter.upbjj": function () {
      this.filter.kategori = "";
    },
    /* 2) Daftar berubah (filter/hapus) => tooltip baris yang hilang ikut ditutup */
    tampil: function (daftar) {
      var kode = this.tooltipKode;
      if (kode && !daftar.some(function (s) { return s.kode === kode; })) this.tooltipKode = "";
    }
  },

  methods: {
    statusStok: function (s) {
      if (s.qty === 0) return "kosong";
      if (s.qty < s.safety) return "menipis";
      return "aman";
    },
    resetFilter: function () {
      this.filter = { upbjj: "", kategori: "", status: "semua", kata: "" };
      this.urut = { kunci: "judul", arah: "asc" };
    },

    /* tooltip catatan: event mouse (hover) dan keyboard (fokus) */
    tampilTooltip: function (kode) { this.tooltipKode = kode; },
    sembunyiTooltip: function () { this.tooltipKode = ""; },

    /* tambah & ubah */
    bukaTambah: function () {
      this.modeForm = "baru";
      this.formData = { kode: "", judul: "", kategori: "", upbjj: "", lokasiRak: "", harga: "", qty: "", safety: "", catatanHTML: "" };
      this.formTampil = true;
    },
    bukaEdit: function (item) {
      this.modeForm = "edit";
      this.formData = Object.assign({}, item);
      this.formTampil = true;
    },
    tutupForm: function () {
      this.formTampil = false;
    },
    simpanForm: function (data) {
      this.$emit("simpan", { mode: this.modeForm, data: data });
      if (this.modeForm === "baru") this.resetFilter(); /* agar baris baru pasti terlihat */
      this.formTampil = false;
    },

    /* hapus dengan konfirmasi */
    mintaHapus: function (item) { this.hapusItem = item; },
    batalHapus: function () { this.hapusItem = null; },
    konfirmasiHapus: function () {
      if (!this.hapusItem) return;
      this.$emit("hapus", this.hapusItem.kode);
      this.hapusItem = null;
    }
  }
});
