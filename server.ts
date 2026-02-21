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

  app.use(express.json());

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

      // Try TCC first
      let compileCmd = `tcc -o ${outPath} ${cPath}`;
      let compileSuccess = false;
      let compileError = "";

      try {
        await execAsync(compileCmd);
        compileSuccess = true;
      } catch (e: any) {
        compileError = e.stderr || e.message;
        // Fallback to Clang
        try {
          compileCmd = `clang -o ${outPath} ${cPath}`;
          await execAsync(compileCmd);
          compileSuccess = true;
        } catch (e2: any) {
          compileError = e2.stderr || e2.message;
        }
      }

      if (!compileSuccess) {
        return res.json({ success: false, error: `Compilation Error:\n${compileError}` });
      }

      // Execute with inputs (simple one-shot for now as per "fetch" request)
      // In a real Docker env, we'd use 'docker run'
      const inputStr = inputs.join("\n");
      const { stdout, stderr } = await execAsync(`echo "${inputStr}" | ${outPath}`);

      res.json({ success: true, stdout, stderr });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
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
