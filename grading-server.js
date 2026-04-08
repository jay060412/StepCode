const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // 클라이언트에서 접근 가능하도록 CORS 허용

/**
 * 채점 엔드포인트
 * POST /grade
 * Body: { code: string, testCases: Array<{input: string, output: string}> }
 */
app.post('/grade', async (req, res) => {
  const { code, testCases } = req.body;
  
  if (!code || !testCases) {
    return res.status(400).json({ error: 'Missing code or testCases' });
  }

  try {
    const results = [];
    let allPassed = true;

    // 각 테스트 케이스에 대해 순차적으로 실행
    for (const tc of testCases) {
      const result = await runTestCase(code, tc.input, tc.output);
      results.push(result);
      if (!result.passed) allPassed = false;
    }

    res.json({
      results,
      allPassed,
      score: allPassed ? 100 : Math.floor((results.filter(r => r.passed).length / results.length) * 100)
    });
  } catch (error) {
    console.error('Grading error:', error);
    res.status(500).json({ error: 'Internal grading error' });
  }
});

/**
 * 파이썬 코드를 실행하고 결과를 반환하는 함수
 */
function runTestCase(code, input, expectedOutput) {
  return new Promise((resolve) => {
    const filename = path.join(__dirname, `temp_${uuidv4()}.py`);
    fs.writeFileSync(filename, code);

    // python3 명령어로 실행 (타임아웃 2초)
    const child = exec(`python3 ${filename}`, { timeout: 2000 }, (error, stdout, stderr) => {
      // 임시 파일 삭제
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
      }
      
      const actualOutput = stdout.trim();
      const expected = expectedOutput.trim();
      
      // 결과 비교 (공백 제거 후 비교)
      const passed = actualOutput === expected;
      
      resolve({
        passed,
        input,
        expected,
        actual: actualOutput || stderr.trim()
      });
    });

    // 표준 입력(stdin) 주입
    if (input) {
      child.stdin.write(input + '\n');
      child.stdin.end();
    }
  });
}

const PORT = 25860;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Grading server running on http://0.0.0.0:${PORT}`);
});
