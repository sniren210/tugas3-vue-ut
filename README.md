# SITTA — Tugas Praktik 3 (Vue Component & Template) — STSI4209

Disusun oleh Rendi Dwi Kurniasandi, NIM 055320736, Program Studi Sistem Informasi.

Vue 2.7.16 dimuat dari CDN; jika offline, otomatis memakai `js/vendor/vue.min.js`.

## Struktur

```
tugas3-vue-ut/
├── index.html                  root: mount #app, tab state (stok | tracking | order)
├── assets/
│   ├── css/style.css
│   └── img/logo.svg
├── data/dataBahanAjar.json     sumber data
├── js/
│   ├── app.js                  inisialisasi Vue root + state + handler event
│   ├── utils.js                fungsi bantu (tanggal lokal, sanitasi catatan)
│   ├── filters.js              Vue.filter: rupiah, buah, tanggalPanjang, waktuPendek
│   ├── services/api.js         fetch JSON & template, merapikan data tracking
│   └── components/
│       ├── stock-table.js      <ba-stock-table>
│       ├── stock-form.js       <ba-stock-form>
│       ├── do-tracking.js      <do-tracking>
│       ├── order-form.js       <order-form>
│       ├── status-badge.js     <status-badge>
│       └── app-modal.js        <app-modal>
└── templates/                  stock-table, stock-form, do-tracking, order-form, status-badge, app-modal (.html)
```

Id template konsisten: `tpl-stock`, `tpl-stock-form`, `tpl-tracking`, `tpl-order`, `tpl-badge`, `tpl-modal`. Berkas di `templates/` disisipkan sebagai `<template id="...">` oleh `api.js` sebelum komponen dibuat.
