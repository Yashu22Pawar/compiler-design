const editor = CodeMirror(document.getElementById("editor"), {
    lineNumbers: true,
    mode: "text/x-c++src",
    theme: "night",
    autoCloseBrackets: true,
    matchBrackets: true,
    tabSize: 4,
    value: "// Write your code here"
});

document.getElementById("language").addEventListener("change", function () {
    const lang = this.value;
    let mode = "text/x-c++src";
    if (lang === "Python") mode = "python";
    if (lang === "Java") mode = "text/x-java";
    editor.setOption("mode", mode);
});

document.getElementById("runBtn").addEventListener("click", async () => {
    const code = editor.getValue();
    const input = document.getElementById("input").value;
    const lang = document.getElementById("language").value;

    const resBox = document.getElementById("output");
    resBox.textContent = "Running...";

    try {
        const res = await fetch("http://localhost:8000/compile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, input, lang })
        });

        const data = await res.json();
        resBox.textContent = data.output || data.error;
    } catch (err) {
        resBox.textContent = "Error connecting to server: " + err.message;
    }
});
