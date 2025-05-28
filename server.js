const express = require('express');
const bodyParser = require('body-parser');
const compiler = require('compilex');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
compiler.init({ stats: true, tempDir });

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname));

app.post('/compile', (req, res) => {
  const { code, input, lang } = req.body;

  if (!code || !lang) {
    return res.status(400).json({ error: "Missing code or language" });
  }

  const envData = {
    OS: process.platform === 'win32' ? 'windows' : 'linux',
    options: { timeout: 10000 }
  };

  let responded = false;

  const handleResult = (data) => {
    if (responded) return;
    responded = true;
    res.json({ 
      output: data.output || "No output",
      error: data.error 
    });
  };

  try {
    switch (lang) {
      case 'Cpp':
        const cppEnv = { ...envData, cmd: 'g++' };
        input ? compiler.compileCPPWithInput(cppEnv, code, input, handleResult)
              : compiler.compileCPP(cppEnv, code, handleResult);
        break;
      
      case 'Python':
        input ? compiler.compilePythonWithInput(envData, code, input, handleResult)
              : compiler.compilePython(envData, code, handleResult);
        break;
      
      case 'Java':
        if (!code.includes('public class Main')) {
          return res.status(400).json({ error: "Java code must contain 'public class Main'" });
        }
        input ? compiler.compileJavaWithInput(envData, code, input, handleResult)
              : compiler.compileJava(envData, code, handleResult);
        break;
      
      default:
        return res.status(400).json({ error: "Unsupported language" });
    }
  } catch (e) {
    if (!responded) {
      responded = true;
      res.status(500).json({ error: e.message });
    }
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});