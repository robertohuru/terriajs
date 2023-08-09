import { Credit } from "cesium";

function createCredit(text, url) {
  if (!text && !url) {
    return undefined;
  }

  if (text && !url) {
    return new Credit(text);
  }

  text = text || url;

  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.innerText = text;
  return new Credit(a.outerHTML);
}

export default createCredit;