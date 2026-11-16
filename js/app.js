/*
   SITTA Vue   app.js
   Inisialisasi Vue root. Root memegang seluruh state (sumber kebenaran);
   komponen menerima data lewat props dan mengirim perubahan lewat event.
   */
var DAFTAR_TAB = ["stok", "tracking", "order"];

function tabAwal() {
  var dariHash = window.location.hash.replace("#", "");
  return DAFTAR_TAB.indexOf(dariHash) !== -1 ? dariHash : "stok";
}

var app = new Vue({
  el: "#app",
  data: {
    tab: tabAwal(), /* 'stok' | 'tracking' | 'order' */
    siap: false,
    galatMuat: "",
    state: {
      upbjjList: [],
      kategoriList: [],
      pengirimanList: [],
      paket: [],
      stok: [],
      tracking: []
    },
    fokusNomor: "",
    toast: "",
    timerToast: null
  },

  computed: {
    /* Nomor DO otomatis: DO + tahun berjalan + urutan 3 digit.
       Urutan = nomor terbesar pada tahun yang sama + 1. */
    nomorDOBerikutnya: function () {
      var tahun = new Date().getFullYear();
      var pola = new RegExp("^DO" + tahun + "-(\\d+)$");
      var terbesar = 0;
      this.state.tracking.forEach(function (d) {
        var cocok = pola.exec(d.nomor);
        if (cocok) terbesar = Math.max(terbesar, Number(cocok[1]));
      });
      var urut = String(terbesar + 1);
      while (urut.length < 3) urut = "0" + urut;
      return "DO" + tahun + "-" + urut;
    }
  },

  watch: {
    /* Tab aktif tercermin di judul halaman dan hash URL (reload tetap di tab yang sama) */
    tab: {
      immediate: true,
      handler: function (t) {
        var nama = { stok: "Stok", tracking: "Tracking DO", order: "Pemesanan" }[t];
        document.title = nama + "   SITTA";
        try {
          if (window.location.hash.replace("#", "") !== t) window.history.replaceState(null, "", "#" + t);
        } catch (e) { /* diabaikan bila dibuka dari file:// */ }
      }
    }
  },

  created: function () {
    var self = this;
    Api.muatSemua()
      .then(function (data) {
        self.state = data;
        self.siap = true; /* komponen baru dibuat sesudah template tersedia */
      })
      .catch(function (err) {
        self.galatMuat = err && err.message ? err.message : "Terjadi kesalahan saat memuat data.";
      });
  },

  methods: {
    tampilToast: function (teks) {
      var self = this;
      this.toast = teks;
      clearTimeout(this.timerToast);
      this.timerToast = setTimeout(function () { self.toast = ""; }, 3500);
    },

    /* ----- stok: create & update ----- */
    simpanStok: function (payload) {
      var data = payload.data;
      if (payload.mode === "baru") {
        this.state.stok.push(data);
        this.tampilToast(data.kode + " ditambahkan ke daftar stok.");
      } else {
        var target = this.state.stok.find(function (s) { return s.kode === data.kode; });
        if (target) Object.assign(target, data);
        this.tampilToast("Data " + data.kode + " diperbarui.");
      }
    },

    /* ----- stok: delete ----- */
    hapusStok: function (kode) {
      var i = this.state.stok.findIndex(function (s) { return s.kode === kode; });
      if (i !== -1) this.state.stok.splice(i, 1);
      this.tampilToast(kode + " dihapus dari daftar stok.");
    },

    /* ----- DO baru dari <order-form> ----- */
    handleNewDO: function (dobaru) {
      this.state.tracking.push(dobaru);
      this.fokusNomor = dobaru.nomor;
      this.tab = "tracking";
      this.tampilToast(dobaru.nomor + " berhasil dibuat.");
    },

    /* ----- progress perjalanan dari <do-tracking> ----- */
    tambahProgress: function (p) {
      var d = this.state.tracking.find(function (x) { return x.nomor === p.nomor; });
      if (!d) return;
      d.perjalanan.push({ waktu: Utils.waktuSekarang(), keterangan: p.keterangan });
      d.status = p.status;
      this.tampilToast("Progress " + p.nomor + " ditambahkan.");
    }
  }
});
