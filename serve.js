const express = require("express");
const bodyParser = require("body-parser");
const { neon } = require("@neondatabase/serverless");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

// 🔹 Habilitar CORS para el frontend que corre en 5500
app.use(cors({ origin: "http://127.0.0.1:5500" }));

// 🔹 Configurar conexión a PostgreSQL en Neon
const DATABASE_URL = "postgresql://neondb_owner:npg_lwCdU6Rq3Arz@ep-young-snow-a8dafbei-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Servir archivos estáticos desde `public/`

// 🔹 Ruta para obtener usuarios
app.get("/usuarios", async (req, res) => {
    try {
        const usuarios = await sql`SELECT * FROM usuarios`;
        res.json(usuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).send("Error en la base de datos");
    }
});

// 🔹 Ruta para registrar usuario
app.post("/registro", async (req, res) => {
    const { nombre, apellido, correo, telefono } = req.body;

    try {
        await sql`
        INSERT INTO usuarios (nombre, apellido, correo, telefono, status) 
        VALUES (${nombre}, ${apellido}, ${correo}, ${telefono}, 'A')
        `;

        res.status(200).json({ redirect: "/menu.html" });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).send("Error en el registro");
    }
});

// 🔹 Ruta para desactivar usuario (eliminado lógico)
app.put("/usuarios/desactivar/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql`
            UPDATE usuarios
            SET status = 'I'
            WHERE id = ${id}
            RETURNING *;
        `;

        if (result.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: `Usuario con ID ${id} desactivado correctamente.` });
    } catch (error) {
        console.error("Error al desactivar usuario:", error);
        res.status(500).send("Error en la base de datos");
    }
});

// 🔹 Ruta para restaurar usuario
app.put("/usuarios/restaurar/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql`
            UPDATE usuarios
            SET status = 'A'
            WHERE id = ${id}
            RETURNING *;
        `;

        if (result.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: `Usuario con ID ${id} restaurado correctamente.` });
    } catch (error) {
        console.error("Error al restaurar usuario:", error);
        res.status(500).send("Error en la base de datos");
    }
});

// Ruta para editar un usuario
app.put("/usuarios/editar/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, correo, telefono } = req.body;

    try {
        const result = await sql`
            UPDATE usuarios
            SET nombre = ${nombre}, apellido = ${apellido}, correo = ${correo}, telefono = ${telefono}
            WHERE id = ${id}
            RETURNING *;
        `;

        if (result.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: `Usuario con ID ${id} actualizado correctamente.`, usuario: result[0] });
    } catch (error) {
        console.error("Error al editar usuario:", error);
        res.status(500).send("Error en la base de datos");
    }
});

// 🔹 Servir `menu.html` desde la carpeta `public/`
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "menu.html"));
});

// 🔹 Iniciar el servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
