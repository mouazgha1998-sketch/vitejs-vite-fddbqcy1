if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(err => console.log("SW error:", err));
  });
}


self.addEventListener("fetch", (event) => {
  // هذا الكود يترك فارغاً فقط لتفعيل ميزة التثبيت
});