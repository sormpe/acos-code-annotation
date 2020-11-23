document.addEventListener("DOMContentLoaded", function (event) {
  const windowData = window.codeAnnotation;
  const element = document.getElementById("annotated-content");
  const id = element.getAttribute("data-id");

  if (windowData[id]) {
    const data = windowData[id];
    const pre = document.createElement("pre");

    const annotatedContent = document.getElementById("annotated-content");
    annotatedContent.appendChild(pre);
    pre.className = "prism-code language-" + data[0].language;

    const code = document.createElement("code");
    code.className = "language-" + data[0].language;
    pre.appendChild(code);

    code.textContent = data[1].content;
    code.setAttribute("style", "white-space: pre-wrap;");

    Prism.highlightElement(code);

    for (d of data[2].annotations) {
      const annotations = document.getElementById("annotations");

      const div = document.createElement("div");
      div.innerHTML = d.annotation;
      div.id = "annotation-for-" + d.index;
      annotations.appendChild(div);
      annotations.setAttribute("style", "white-space: pre-wrap;");
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
const instanceId =
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

  const annotatedContent = document.getElementById("annotated-content");

  for (let i = 0; i < annotatedContent.children.length; i++) {
    const element = annotatedContent.children[i];

    for (let j = 0; j < data[2].annotations.length; j++) {
      if (obj.target.id.slice(-1) === data[2].annotations[j].index.toString()) {
        const idx = data[2].annotations[j].locIndex;
        const idxEnd = idx + data[2].annotations[j].content.length;

        for (let item of annotatedContent.children[0].childNodes) {
          item.textContent = "";
        }

        const span1 = document.createElement("span");
        const before = data[1].content.substring(0, idx);
        span1.textContent = before;

        const string = data[1].content.substring(idx, idxEnd);
        const span2 = document.createElement("span");
        span2.textContent = string;

        const span3 = document.createElement("span");
        const after = data[1].content.substring(idxEnd, data[1].content.length);
        span3.textContent = after;

        element.children[0].appendChild(span1);
        element.children[0].appendChild(span2);
        span2.id = "search-term";
        span2.setAttribute("style", "background-color:crimson");
        element.setAttribute("style", "white-space: pre-wrap;");

        annotatedContent.children[0].appendChild(span3);
        Prism.highlightElement(span1);
        Prism.highlightElement(span3);
        start = Date.now();

        interval = setInterval(counter, 1);
        if (window.ACOS) {
          ACOS.sendEvent("log", {
            id: id,
            instanceId: instanceId,
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
      instanceId: instanceId,
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

  const annotatedContent = document.getElementById("annotated-content");
  removeChildren(annotatedContent.childNodes[0]);

  const code = document.createElement("code");
  code.className = "language-" + data[0].language;

  annotatedContent.children[0].appendChild(code);
  code.setAttribute("style", "white-space: pre-wrap;");

  code.textContent = data[1].content;
  Prism.highlightElement(code);
};
