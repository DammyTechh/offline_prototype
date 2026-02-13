import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useExamStore } from "./stores/examStore";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const store = useExamStore(pinia);

window.addEventListener("online", () => {
  store.syncAnswers();
});

app.mount("#app");
