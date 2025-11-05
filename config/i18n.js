const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    preload: ["en", "ar", "fr"],
    backend: {
      loadPath: __dirname + "/../locales/{{lng}}/translation.json", // make sure the path is correct
    },
    detection: {
      order: ["querystring", "header"],
      caches: false,
    },
    debug: false, // you can turn this to true for testing
  });

module.exports = { i18next, i18nextMiddleware: middleware.handle(i18next) };
