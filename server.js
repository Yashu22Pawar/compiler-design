const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const compiler = require("compilex");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Create temp directory if not exists
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Initialize compiler
compiler.init({ stats: true, tempDir });

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname));

// Serve index page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Compile API
app.post("/compile", (req, res) => {
  const { code, input, lang } = req.body;

  const envData = {
    OS: process.platform === "win32" ? "windows" : "linux",
    options: { timeout: 10000 },
  };

  if (!code || !lang) {
    return res.status(400).json({ error: "Missing code or language." });
  }

  let responded = false;

  function safeHandle(data) {
    if (responded) return;
    responded = true;
    handleCompilationResult(data, res);
  }

  try {
    if (lang === "Cpp") {
      const cppEnv = { ...envData, cmd: "g++" };
      if (input && input.trim() !== "") {
        compiler.compileCPPWithInput(cppEnv, code, input, safeHandle);
      } else {
        compiler.compileCPP(cppEnv, code, safeHandle);
      }
    } else if (lang === "Python") {
      if (input && input.trim() !== "") {
        compiler.compilePythonWithInput(envData, code, input, safeHandle);
      } else {
        compiler.compilePython(envData, code, safeHandle);
      }
    } else if (lang === "Java") {
      if (!code.includes("public class Main")) {
        return res.status(400).json({ error: "Please use 'Main' as the class name in your Java code." });
      }
      if (input && input.trim() !== "") {
        compiler.compileJavaWithInput(envData, code, input, safeHandle);
      } else {
        compiler.compileJava(envData, code, safeHandle);
      }
    } else {
      return res.status(400).json({ error: "Unsupported language" });
    }
  } catch (e) {
    return res.status(500).json({ error: "Internal error: " + e.message });
  }
});

// Response handler
function handleCompilationResult(data, res) {
  if (res.headersSent) return;
  if (data.error) {
    return res.status(500).json({ error: data.error.toString() });
  }
  return res.json({ output: data.output || "No output" });
}

// Start server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
