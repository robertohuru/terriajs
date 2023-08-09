"use strict";
import i18next from "i18next";

import { DeveloperError } from "cesium";

function readText(file) {
  return new Promise((resolve, reject) => {
    if (typeof file === "undefined") {
      throw new DeveloperError(i18next.t("core.readText.fileRequired"));
    }

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function (event) {
      const allText = event.target.result;
      resolve(allText);
    };
    reader.onerror = function (e) {
      reject(e);
    };
  });
}

export default readText;