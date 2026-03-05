import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("CRÍTICO: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configuradas.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. PRIORIDAD ABSOLUTA: Registro de depuración para TODAS las peticiones
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API DEBUG] ${req.method} ${req.url}`);
    }
    next();
  });

  // 2. RUTAS DE API (Definidas antes que cualquier otra cosa)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // RUTA DE PEDIDOS (Movida arriba para máxima prioridad)
  app.all(["/api/orders", "/api/orders/"], async (req, res) => {
    console.log(`[ORDERS ROUTE] Capturado: ${req.method} ${req.url}`);

    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: "Método no permitido", 
        details: `Se esperaba POST pero se recibió ${req.method}` 
      });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
        error: "Error de configuración", 
        details: "Faltan las credenciales de Supabase en el servidor." 
      });
    }

    try {
      const { user_id, items, total, status, transport_id, address, customer_name, customer_phone } = req.body;
      const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const payload = {
        user_id: (user_id && isValidUUID(user_id)) ? user_id : null,
        items,
        total,
        status: status || 'pending',
        transport_id: (transport_id && isValidUUID(transport_id)) ? transport_id : null,
        address,
        customer_name,
        customer_phone
      };

      const { data, error } = await supabaseAdmin
        .from('orders')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("[SUPABASE ERROR]", error);
        return res.status(500).json({ error: error.message, details: error.hint });
      }

      console.log("[SUCCESS] Pedido creado:", data.id);
      return res.json({ success: true, order: data });
    } catch (err: any) {
      console.error("[SERVER EXCEPTION]", err);
      return res.status(500).json({ error: "Error interno", details: err.message });
    }
  });

  // Otras rutas de API...
  app.post("/api/invite-admin", async (req, res) => {
    const { email, role, invitedBy } = req.body;
    
    // Validar que el que invita sea admin
    const { data: inviter, error: inviterError } = await supabaseAdmin
      .from('users')
      .select('roles')
      .eq('id', invitedBy)
      .single();

    if (inviterError || !inviter?.roles.includes('admin')) {
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

  // POST /api/create-user (Direct creation by Super Admin)
  app.post("/api/create-user", async (req, res) => {
    const { email, password, fullName, roles, departmentId, transportLineId, phoneNumber, invitedBy } = req.body;
    
    console.log(`Intentando crear usuario: ${email} por inviter: ${invitedBy}`);

    try {
      // 1. Validar que el que crea sea admin
      // Primero intentamos en la tabla pública
      let { data: inviter, error: inviterError } = await supabaseAdmin
        .from('users')
        .select('email, roles')
        .eq('id', invitedBy)
        .single();

      let isAuthorized = false;
      
      if (inviter) {
        const isSuperAdmin = inviter.email === 'jjtovar1510@gmail.com';
        if (isSuperAdmin || inviter.roles.includes('admin')) {
          isAuthorized = true;
        }
      } else {
        // Si no está en la tabla pública, verificamos en Auth directamente (para el super admin inicial)
        const { data: authInviter, error: authInviterError } = await supabaseAdmin.auth.admin.getUserById(invitedBy);
        if (authInviter?.user?.email === 'jjtovar1510@gmail.com') {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        console.error("Error de autorización: El usuario que invita no tiene permisos suficientes.");
        return res.status(403).json({ error: "No autorizado para crear usuarios." });
      }

      // 2. Crear usuario en Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });

      if (authError) {
        console.error("Error al crear usuario en Auth:", authError.message);
        return res.status(500).json({ error: authError.message });
      }

      console.log(`Usuario creado en Auth: ${authUser.user.id}`);

      // 3. Actualizar perfil en public.users
      // El trigger handle_new_user ya debería haberlo creado, pero aseguramos los campos extra
      const { error: profileError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: authUser.user.id,
          email,
          roles: roles || ['customer'],
          department_id: departmentId || null,
          transport_line_id: transportLineId || null,
          phone_number: phoneNumber || null,
          full_name: fullName,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error("Error al actualizar perfil en DB:", profileError.message);
        return res.status(500).json({ error: profileError.message });
      }

      console.log("Perfil de usuario actualizado exitosamente.");
      res.json({ success: true, user: authUser.user });

    } catch (err: any) {
      console.error("Error inesperado en create-user:", err);
      res.status(500).json({ error: err.message });
    }
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
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('roles')
      .eq('id', userId)
      .single();

    if (userError) return res.status(500).json({ error: userError.message });

    const newRoles = Array.from(new Set([...user.roles, invite.role_to_grant]));

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ roles: newRoles })
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
    // En producción, servimos estáticos PERO ignoramos cualquier ruta que empiece por /api
    app.use((req, res, next) => {
      if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: "Ruta de API no encontrada", path: req.url });
      }
      next();
    });
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  // Global Error Handler - Ensure JSON response for all errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("GLOBAL ERROR HANDLER:", err);
    res.status(500).json({
      error: "Error interno del servidor",
      details: err.message || "Ocurrió un error inesperado"
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
