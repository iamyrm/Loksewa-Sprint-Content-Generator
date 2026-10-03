/* Nepal Rivers card generator: parse JSON -> render rows -> print canvas */
(function () {
  "use strict";

  var MAX_ROWS = 14;
  var NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

  var SAMPLE = [
    { "त्रिशूली नदी": "हरिश्रुङ्खनी" },
    { "कालीगण्डकी नदी": "कृष्णप्रभा" },
    { "बुढीगण्डकी नदी": "यशोधरा" },
    { "मरस्याङ्दी नदी": "चितप्रभा" },
  ];

  /* Same array, used as the textarea placeholder so the format is visible */
  var SAMPLE_TEXT = JSON.stringify(SAMPLE, null, 2);

  var titleInput = document.getElementById("titleInput");
  var dataInput = document.getElementById("dataInput");
  var titleBox = document.getElementById("titleBox");
  var rowsBox = document.getElementById("rows");
  var statusBox = document.getElementById("status");
  var printBtn = document.getElementById("printBtn");
  var sampleBtn = document.getElementById("sampleBtn");
  var clearBtn = document.getElementById("clearBtn");
  var colorBtn = document.getElementById("colorBtn");

  dataInput.placeholder = SAMPLE_TEXT;

  function toNepaliNumber(value) {
    return String(value).replace(/[0-9]/g, function (digit) {
      return NEPALI_DIGITS[Number(digit)];
    });
  }

  /* Accepts full JSON array, or bare objects/commas without outer brackets */
  function parseData(raw) {
    var text = String(raw || "").trim();
    if (!text) return [];

    var attempts = [text];
    var wrapped = text.replace(/,\s*$/, "");
    if (wrapped.charAt(0) !== "[") attempts.push("[" + wrapped + "]");

    var parsed = null;
    var lastError = null;

    for (var i = 0; i < attempts.length; i++) {
      try {
        parsed = JSON.parse(attempts[i]);
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (parsed === null) throw lastError || new Error("JSON parse failed");
    if (!Array.isArray(parsed)) throw new Error("Data must be a JSON array.");

    return parsed
      .map(function (entry) {
        if (!entry || typeof entry !== "object")
          return { name: String(entry || ""), ancient: "" };
        var keys = Object.keys(entry);
        var key = keys.length ? keys[0] : "";
        return {
          name: String(key),
          ancient: String(entry[key] == null ? "" : entry[key]),
        };
      })
      .filter(function (row) {
        return row.name !== "";
      });
  }

  function makeRow(row, index) {
    var el = document.createElement("div");
    el.className = "row";

    var left = document.createElement("div");
    left.className = "col-left";

    var num = document.createElement("div");
    num.className = "number-box";
    num.textContent = toNepaliNumber(index + 1);

    var name = document.createElement("div");
    name.className = "river-name";
    name.textContent = row.name;

    left.appendChild(num);
    left.appendChild(name);

    var right = document.createElement("div");
    right.className = "col-right";

    var arrow = document.createElement("div");
    arrow.className = "arrow";
    arrow.textContent = "→";

    var ancient = document.createElement("div");
    ancient.className = "ancient-name";
    ancient.textContent = row.ancient;

    right.appendChild(arrow);
    right.appendChild(ancient);

    el.appendChild(left);
    el.appendChild(right);

    return el;
  }

  function setStatus(message, isError) {
    statusBox.textContent = message;
    statusBox.classList.toggle("error", Boolean(isError));
  }

  function applyEditable() {
    titleBox.setAttribute("contenteditable", "true");
    titleBox.setAttribute("spellcheck", "false");

    var names = rowsBox.querySelectorAll(".river-name, .ancient-name");
    for (var i = 0; i < names.length; i++) {
      names[i].setAttribute("contenteditable", "true");
      names[i].setAttribute("spellcheck", "false");
    }
  }

  // color applied to selection only

  function render() {
    var title = titleInput.value.trim();
    titleBox.textContent = title || " ";

    var rows;
    try {
      rows = parseData(dataInput.value);
    } catch (err) {
      rowsBox.textContent = "";
      setStatus("JSON error: " + err.message, true);
      return;
    }

    var visible = rows.slice(0, MAX_ROWS);
    var fragment = document.createDocumentFragment();
    visible.forEach(function (row, index) {
      fragment.appendChild(makeRow(row, index));
    });
    rowsBox.textContent = "";
    rowsBox.appendChild(fragment);
    applyEditable();

    if (rows.length > MAX_ROWS) {
      setStatus(
        visible.length +
          " / " +
          MAX_ROWS +
          " rows shown (" +
          (rows.length - MAX_ROWS) +
          " extra ignored)",
      );
    } else {
      setStatus(rows.length + " / " + MAX_ROWS + " rows");
    }
  }

  titleInput.addEventListener("input", render);
  dataInput.addEventListener("input", render);

  sampleBtn.addEventListener("click", function () {
    titleInput.value = "नेपालका प्रमुख नदीहरू";
    dataInput.value = JSON.stringify(SAMPLE, null, 2);
    render();
  });

  clearBtn.addEventListener("click", function () {
    titleInput.value = "";
    dataInput.value = "";
    render();
  });

  if (colorBtn) {
    colorBtn.addEventListener("click", function () {
      try {
        document.execCommand("styleWithCSS", false, true);
        document.execCommand("foreColor", false, "#e60000");
      } catch (e) {}
    });
  }

  printBtn.addEventListener("click", function () {
    window.print();
  });

  /* start empty so the placeholder (format sample) stays visible */
  render();
})();
