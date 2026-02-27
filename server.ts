import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // POST /api/invite-admin
  app.post("/api/invite-admin", async (req, res) => {
    const { email, role, invitedBy } = req.body;
    
    // Validar que el que invita sea admin
    const { data: inviter, error: inviterError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', invitedBy)
      .single();

    if (inviterError || inviter?.role !== 'admin') {
      return res.status(403).json({ error: "No autorizado" });
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const { data, error } = await supabaseAdmin
      .from('admin_invites')
      .insert({
        email,
        role_to_grant: role,
        token,
        invited_by: invitedBy
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Aquí se enviaría el email con el token
    console.log(`Invitación enviada a ${email} con token: ${token}`);

    res.json({ success: true, invite: data });
  });

  // POST /api/accept-invite
  app.post("/api/accept-invite", async (req, res) => {
    const { token, userId } = req.body;

    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('admin_invites')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .single();

    if (inviteError || !invite) {
      return res.status(400).json({ error: "Token inválido o expirado" });
    }

    // Actualizar rol del usuario
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role: invite.role_to_grant })
      .eq('id', userId);

    if (updateError) return res.status(500).json({ error: updateError.message });

    // Marcar invitación como aceptada
    await supabaseAdmin
      .from('admin_invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    res.json({ success: true, role: invite.role_to_grant });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
