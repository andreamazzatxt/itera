import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";

const locales = ["en", "it"];
const defaultLocale = "en";

function negotiateLocale(
  acceptLanguage: string | null,
  supported: string[],
  fallback: string
) {
  if (!acceptLanguage) return fallback;

  const parsed = acceptLanguage
    .split(",")
    .map((part) => {
      const [lang, qValue] = part.trim().split(";q=");
      return {
        lang: lang.split("-")[0],
        q: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of parsed) {
    if (supported.includes(lang)) {
      return lang;
    }
  }
  return fallback;
}

export default getRequestConfig(async () => {
  const langHeader = (await headers()).get("accept-language");

  const locale = negotiateLocale(langHeader, locales, defaultLocale);

  console.log("Detected locale:", locale);

  return {
    locale: "en",
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
