/* <status-badge :qty="..." :safety="...">   penanda status stok (Aman/Menipis/Kosong) */
Vue.component("status-badge", {
  template: "#tpl-badge",
  props: {
    qty: { type: Number, required: true },
    safety: { type: Number, required: true }
  },
  computed: {
    status: function () {
      if (this.qty === 0) return "kosong";
      if (this.qty < this.safety) return "menipis";
      return "aman";
    },
    label: function () {
      return { kosong: "Kosong", menipis: "Menipis", aman: "Aman" }[this.status];
    }
  }
});
