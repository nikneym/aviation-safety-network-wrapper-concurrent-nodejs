import { parse } from "node-html-parser";
import { createWriteStream } from "fs";

async function process(
  stream,
  requestParams,
  year,
  url,
  trList,
  tdList,
  spanCaption,
  andPage,
  comma,
  lineFeed
) {
  const req = await fetch(url + year, requestParams);

  const root = parse(await req.text());
  const rows = root.querySelectorAll(trList);

  const captionStr = root.querySelector(spanCaption).innerText;
  const total = parseInt(captionStr.slice(0, captionStr.indexOf(32)), 10);

  let numOfPages = ~~(total / 100) + 1;
  if (total % 100 === 0) {
    numOfPages--;
  }

  for (const row of rows) {
    const el = row.querySelector(tdList);

    // fields
    const date = el.innerText;
    const aircraft = el.nextElementSibling.innerText;
    const reg = el.nextElementSibling.nextElementSibling.innerText;
    const operator =
      el.nextElementSibling.nextElementSibling.nextElementSibling.innerText;
    const fat =
      el.nextElementSibling.nextElementSibling.nextElementSibling
        .nextElementSibling.innerText;
    const location =
      el.nextElementSibling.nextElementSibling.nextElementSibling
        .nextElementSibling.nextElementSibling.innerText;
    const dmg =
      el.nextElementSibling.nextElementSibling.nextElementSibling
        .nextElementSibling.nextElementSibling.nextElementSibling
        .nextElementSibling.innerText;

    stream.write(
      date +
        comma +
        aircraft +
        comma +
        reg +
        comma +
        operator +
        comma +
        fat +
        comma +
        location +
        comma +
        dmg +
        lineFeed
    );
  }

  let page = 2;
  while (page <= numOfPages) {
    const req = await fetch(url + year + andPage + page, requestParams);

    const root = parse(await req.text());
    const rows = root.querySelectorAll(trList);

    for (const row of rows) {
      const el = row.querySelector(tdList);

      // fields
      const date = el.innerText;
      const aircraft = el.nextElementSibling.innerText;
      const reg = el.nextElementSibling.nextElementSibling.innerText;
      const operator =
        el.nextElementSibling.nextElementSibling.nextElementSibling.innerText;
      const fat =
        el.nextElementSibling.nextElementSibling.nextElementSibling
          .nextElementSibling.innerText;
      const location =
        el.nextElementSibling.nextElementSibling.nextElementSibling
          .nextElementSibling.nextElementSibling.innerText;
      const dmg =
        el.nextElementSibling.nextElementSibling.nextElementSibling
          .nextElementSibling.nextElementSibling.nextElementSibling
          .nextElementSibling.innerText;

      stream.write(
        date +
          comma +
          aircraft +
          comma +
          reg +
          comma +
          operator +
          comma +
          fat +
          comma +
          location +
          comma +
          dmg +
          lineFeed
      );
    }

    page++;
  }
}

function main() {
  const stream = createWriteStream("./output.csv", {
    highWaterMark: 1024 * 1024 * 1024 * 16,
    flush: true,
  });

  const url = "https://aviation-safety.net/wikibase/dblist.php?Year=";
  const trList = "tr.list";
  const tdList = "td.list";
  const spanCaption = "span.caption";
  const andPage = "&page";
  const comma = ",";
  const lineFeed = "\n";
  const requestParams = {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0",
    },
  };

  for (let year = 1902; year < 2024; year++) {
    process(
      stream,
      requestParams,
      year,
      url,
      trList,
      tdList,
      spanCaption,
      andPage,
      comma,
      lineFeed
    );
  }
}

main();
