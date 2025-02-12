
        document.getElementById("registroForm").addEventListener("submit", async function(event) {
            event.preventDefault(); // Evita recargar la página
    
            const nombre = document.getElementById("name").value;
            const apellido = document.getElementById("lastname").value;
            const correo = document.getElementById("email").value;
            const telefono = document.getElementById("cellphone").value;
    
            try {
                const response = await fetch("http://localhost:3000/registro", {  // ✅ URL corregida
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre, apellido, correo, telefono })
                });
    
                if (!response.ok) {
                    throw new Error(`Error en la solicitud: ${response.statusText}`);
                }
    
                const data = await response.json(); // ✅ Leer la respuesta JSON
    
                if (data.redirect) {
                    window.location.href = data.redirect; // ✅ Redirigir a menu.html
                } else {
                    document.getElementById("message").innerText = data.error || "Error en el registro.";
                }
            } catch (error) {
                console.error("Error en la solicitud:", error);
                document.getElementById("message").innerText = "Error en la conexión.";
            }
        });