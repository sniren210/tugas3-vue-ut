/* <app-modal :tampil="..." judul="..." @tutup="...">   kotak dialog umum.
   Isi lewat slot bawaan; tombol di bawah lewat slot "footer".
   Keyboard: Esc menutup. Fokus dipindah ke dalam modal dan dikembalikan saat ditutup. */
Vue.component("app-modal", {
  template: "#tpl-modal",
  props: {
    tampil: { type: Boolean, default: false },
    judul: { type: String, default: "" },
    ukuran: { type: String, default: "sedang" } /* "sedang" | "kecil" */
  },
  data: function () {
    return { elemenSebelumnya: null };
  },
  computed: {
    idJudul: function () { return "judul-modal-" + this._uid; }
  },
  watch: {
    tampil: function (terbuka) {
      var self = this;
      if (terbuka) {
        this.elemenSebelumnya = document.activeElement;
        document.body.classList.add("modal-terbuka");
        this.$nextTick(function () {
          var kotak = self.$refs.kotak;
          if (!kotak) return;
          var pertama = self.$refs.badan.querySelector("input:not([readonly]), select, textarea, button") ||
            kotak.querySelector(".modal-kaki button");
          (pertama || kotak).focus();
        });
      } else {
        document.body.classList.remove("modal-terbuka");
        if (this.elemenSebelumnya && this.elemenSebelumnya.focus) this.elemenSebelumnya.focus();
      }
    }
  },
  beforeDestroy: function () {
    document.body.classList.remove("modal-terbuka");
  },
  methods: {
    tutup: function () {
      this.$emit("tutup");
    }
  }
});
