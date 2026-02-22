import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Proxy route for external compiler to avoid Mixed Content (HTTPS -> HTTP) issues
  app.post("/api/external-execute", async (req, res) => {
    const { code, inputs = [] } = req.body;
    const externalUrl = process.env.VITE_EXTERNAL_COMPILER_URL || 'http://play.wrd.kr:25860';
    
    // AbortController를 사용하여 10초 타임아웃 설정
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 컴파일 시간이 걸릴 수 있으므로 15초
    
    try {
      console.log(`Forwarding request to: ${externalUrl}/execute`);
      const response = await fetch(`${externalUrl}/execute`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ code, inputs }),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("External server returned non-JSON response:", text);
        return res.status(response.status).json({
          success: false,
          error: `외부 서버 응답 형식 오류 (상태 코드: ${response.status}). 서버 콘솔을 확인해주세요.`
        });
      }
      
      res.status(response.status).json(data);
    } catch (error: any) {
      clearTimeout(timeout);
      console.error("Proxy error:", error);
      const isTimeout = error.name === 'AbortError';
      res.status(500).json({ 
        success: false, 
        error: isTimeout ? "외부 서버 응답 시간 초과 (15초)" : `외부 컴파일 서버 연결 실패: ${error.message}` 
      });
    }
  });

  // API routes
  app.post("/api/execute/c", async (req, res) => {
    const { code, inputs = [] } = req.body;
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const fileName = `code_${Date.now()}`;
    const cPath = path.join(tempDir, `${fileName}.c`);
    const outPath = path.join(tempDir, `${fileName}.out`);

    try {
      fs.writeFileSync(cPath, code);

      // Try compilers in order: TCC -> Clang -> GCC
      const compilers = [
        { name: "TCC", cmd: (out: string, src: string) => `tcc -o ${out} ${src}` },
        { name: "Clang", cmd: (out: string, src: string) => `clang -o ${out} ${src}` },
        { name: "GCC", cmd: (out: string, src: string) => `gcc -o ${out} ${src}` }
      ];

      let compileSuccess = false;
      let lastError = "";
      let usedCompiler = "";

      for (const compiler of compilers) {
        try {
          await execAsync(compiler.cmd(outPath, cPath));
          compileSuccess = true;
          usedCompiler = compiler.name;
          break;
        } catch (e: any) {
          lastError += `${compiler.name} Error: ${e.stderr || e.message}\n`;
        }
      }

      if (!compileSuccess) {
        return res.json({ 
          success: false, 
          error: `모든 컴파일러 시도 실패:\n${lastError}\n\n서버에 컴파일러가 설치되어 있는지 확인해주세요.` 
        });
      }

      // Execute with inputs
      const inputStr = inputs.join("\n");
      // Use a timeout to prevent infinite loops
      const { stdout, stderr } = await execAsync(`echo "${inputStr}" | ${outPath}`, { timeout: 5000 });

      res.json({ success: true, stdout, stderr, compiler: usedCompiler });
    } catch (error: any) {
      const isTimeout = error.signal === 'SIGTERM';
      res.json({ 
        success: false, 
        error: isTimeout ? "실행 시간 초과 (무한 루프 가능성)" : error.message 
      });
    } finally {
      // Cleanup
      [cPath, outPath].forEach(p => {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });
    }
  });

  // Supabase Admin Client (Service Role Key required)
  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL || 'https://cysrtusjyexbhlzmrhgl.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  app.delete("/api/admin/delete-user/:id", async (req, res) => {
    const { id } = req.params;
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ 
        error: "서버에 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. 관리자에게 문의하세요." 
      });
    }
    
    try {
      // 1. Delete from Auth
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (authError) throw authError;

      // 2. Delete from Profiles (though RLS might already handle this if cascading, but let's be sure)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (profileError) throw profileError;

      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  try {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          host: '0.0.0.0',
          port: 3000
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware loaded");
    } else {
      app.use(express.static("dist"));
      app.get("*", (req, res) => {
        res.sendFile("dist/index.html", { root: "." });
      });
    }
  } catch (e) {
    console.error("Vite server error:", e);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
