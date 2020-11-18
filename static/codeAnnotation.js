document.addEventListener("DOMContentLoaded", function (event) {
  const windowData = window.codeAnnotation;
  const element = document.getElementById("annotated-content");
  const id = element.getAttribute("data-id");

  if (windowData[id]) {
    const data = windowData[id];

    const pre = document.createElement("pre");

    const e = document.getElementById("annotated-content");
    e.appendChild(pre);
    pre.className = "prism-code language-" + data[0].language;

    const code = document.createElement("code");
    code.className = "language-" + data[0].language;
    pre.appendChild(code);

    code.textContent = data[1].content;
    code.setAttribute("style", "white-space: pre-wrap;");

    Prism.highlightElement(code);

    for (d of data[2].annotations) {
      const a = document.getElementById("annotations");

      const div = document.createElement("div");
      div.textContent = d.annotation;
      div.id = "annotation-for-" + d.index;
      a.appendChild(div);
      a.setAttribute("style", "white-space: pre-wrap;");
      div.setAttribute(
        "style",
        "border: 1px solid darkseagreen; border-radius: 5px; margin-top: 0.5em; padding: 0.6em 0.2em 0.6em 1em; background-color: greenyellow;"
      );
      div.onmouseover = onMouseOver;
      div.onmouseleave = onMouseLeave;
    }
  }
});

// variables for logging
const userId =
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);
let milliseconds = 0;
let start;
let interval;
const counter = () => {
  milliseconds = Math.floor(Date.now() - start);
};

const onMouseOver = (obj) => {
  const windowData = window.codeAnnotation;
  const element = document.getElementById("annotated-content");
  const id = element.getAttribute("data-id");
  const data = windowData[id];

  const e = document.getElementById("annotated-content");

  for (let i = 0; i < e.children.length; i++) {
    const element = e.children[i];

    for (let j = 0; j < data[2].annotations.length; j++) {
      if (obj.target.id.slice(-1) === data[2].annotations[j].index.toString()) {
        const idx = data[2].annotations[j].locIndex;
        const idxEnd = idx + data[2].annotations[j].content.length;

        for (let item of e.children[0].childNodes) {
          item.textContent = "";
        }

        const span1 = document.createElement("span");
        const before = data[1].content.split(
          data[1].content.substring(idx, idxEnd)
        )[0];
        span1.textContent = before;
        span1.setAttribute("style", "white-space: pre-wrap;");

        const string = data[1].content.substring(idx, idxEnd);
        const span2 = document.createElement("span");
        span2.textContent = string;

        const span3 = document.createElement("span");
        const after = data[1].content.split(
          data[1].content.substring(idx, idxEnd)
        )[1];
        span3.textContent = after;
        span3.setAttribute("style", "white-space: pre-wrap;");

        element.children[0].appendChild(span1);
        element.children[0].appendChild(span2);
        span2.id = "search-term";
        span2.setAttribute("style", "background-color:crimson");
        e.children[0].appendChild(span3);
        Prism.highlightElement(span1);
        Prism.highlightElement(span3);
        start = Date.now();

        interval = setInterval(counter, 1);
        if (window.ACOS) {
          ACOS.sendEvent("log", {
            id: id,
            userid: userId,
            content:
              data[2].annotations[
                obj.target.id.substring(obj.target.id.length - 1) - 1
              ].content,
            annotation:
              data[2].annotations[
                obj.target.id.substring(obj.target.id.length - 1) - 1
              ].annotation,
            type: "mouseOver",
          });
        }
      }
    }
  }
};

function removeChildren(elem) {
  while (elem.hasChildNodes()) {
    if (elem.id === "search-term") {
      elem.removeAttribute("style");
    }

    removeChildren(elem.lastChild);
    elem.removeChild(elem.lastChild);
  }
}

const onMouseLeave = (obj) => {
  clearInterval(interval);

  const windowData = window.codeAnnotation;
  const element = document.getElementById("annotated-content");
  const id = element.getAttribute("data-id");
  const data = windowData[id];

  if (window.ACOS) {
    ACOS.sendEvent("log", {
      id: id,
      userid: userId,
      content:
        data[2].annotations[
          obj.target.id.substring(obj.target.id.length - 1) - 1
        ].content,
      annotation:
        data[2].annotations[
          obj.target.id.substring(obj.target.id.length - 1) - 1
        ].annotation,
      type: "mouseLeave",
      time: milliseconds,
    });
  }
  milliseconds = 0;

  const e = document.getElementById("annotated-content");
  removeChildren(e.childNodes[0]);

  const code = document.createElement("code");
  code.className = "language-" + data[0].language;

  e.children[0].appendChild(code);
  code.setAttribute("style", "white-space: pre-wrap;");

  code.textContent = data[1].content;
  Prism.highlightElement(code);
};
