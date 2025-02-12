
        //MODAL RESETEADOR:
        $(document).ready(function () {
            cargarUsuarios();
            $("#toggleStatus").change(function () {
                cargarUsuarios();
            });

            $('#usuarioModal').on('hidden.bs.modal', function () {
                $("#usuarioForm")[0].reset();  // Limpia el formulario al cerrar el modal
                $("#usuarioId").val("");
            });
        });
        //.

        $(document).ready(function () {
            cargarUsuarios();
            $("#toggleStatus").change(function () {
                cargarUsuarios();
            });
        });

        async function cargarUsuarios() {
            let mostrarInactivos = $("#toggleStatus").prop("checked");
            
            try {
                let response = await fetch("http://localhost:3000/usuarios");
                let usuarios = await response.json();
                let tbody = $("#userTableBody");
                let dataTable = $("#userTable").DataTable();

                if ($.fn.DataTable.isDataTable("#userTable")) {
                    dataTable.destroy();
                }

                tbody.empty();

                let usuariosFiltrados = usuarios.filter(user => 
                    mostrarInactivos ? user.status === 'I' : user.status === 'A'
                );

                if (usuariosFiltrados.length === 0) {
                    $("#error-message").text("No hay usuarios disponibles.");
                    return;
                } else {
                    $("#error-message").text("");
                }

                usuariosFiltrados.forEach(user => {
                    let opciones = user.status === 'A'
                        ? `<div class="d-flex flex-column">
                            <button class="btn btn-warning btn-sm mb-1" onclick="editarUsuario(${user.id})">
                                <i class="bi bi-pencil"></i> Editar
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarUsuario(${user.id})">
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                        </div>`
                        : `<button class="btn btn-success btn-sm" onclick="restaurarUsuario(${user.id})">
                            <i class="bi bi-arrow-counterclockwise"></i> Restaurar
                        </button>`;
                    tbody.append(`
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.nombre}</td>
                            <td>${user.apellido}</td>
                            <td>${user.correo}</td>
                            <td>${user.telefono}</td>
                            <td>${user.status === 'A' ? 'Activo' : 'Inactivo'}</td>
                            <td>${opciones}</td>
                        </tr>
                    `);
                });

                $("#userTable").DataTable({
                    responsive: true,
                    language: {
                        url: "https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json"
                    }
                });

            } catch (error) {
                $("#error-message").text("Error al cargar usuarios.");
                console.error("Error en la petición AJAX", error);
            }
        }

        async function eliminarUsuario(id) {
            const resultado = await Swal.fire({
                title: "¿Estás seguro?",
                text: "Esta acción desactivará al usuario.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar"
            });

            if (resultado.isConfirmed) {
                try {
                    let response = await fetch(`http://localhost:3000/usuarios/desactivar/${id}`, {
                        method: "PUT",
                    });

                    if (response.ok) {
                        Swal.fire("Eliminado", `Usuario con ID ${id} ha sido desactivado.`, "success");
                        cargarUsuarios();
                    } else {
                        Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
                    }
                } catch (error) {
                    console.error("Error al eliminar usuario:", error);
                    Swal.fire("Error", "Hubo un problema al eliminar el usuario.", "error");
                }
            }
        }

        async function restaurarUsuario(id) {
            const resultado = await Swal.fire({
                title: "¿Restaurar usuario?",
                text: "El usuario volverá a estar activo.",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí, restaurar",
                cancelButtonText: "Cancelar"
            });

            if (resultado.isConfirmed) {
                try {
                    let response = await fetch(`http://localhost:3000/usuarios/restaurar/${id}`, {
                        method: "PUT",
                    });

                    if (response.ok) {
                        Swal.fire("Restaurado", `Usuario con ID ${id} ha sido restaurado.`, "success");
                        cargarUsuarios();
                    } else {
                        Swal.fire("Error", "No se pudo restaurar el usuario.", "error");
                    }
                } catch (error) {
                    console.error("Error al restaurar usuario:", error);
                    Swal.fire("Error", "Hubo un problema al restaurar el usuario.", "error");
                }
            }
        }


        function abrirModal(editar = false, id = null, nombre = '', apellido = '', correo = '', telefono = '') {
            $("#usuarioId").val(id);
            $("#nombre").val(nombre);
            $("#apellido").val(apellido);
            $("#correo").val(correo);
            $("#telefono").val(telefono);
            $("#usuarioModalLabel").text(editar ? "Editar Usuario" : "Crear Usuario");
            $("#usuarioModal").modal("show");
        }

        async function guardarUsuario() {
            let id = $("#usuarioId").val();
            let usuario = {
                nombre: $("#nombre").val(),
                apellido: $("#apellido").val(),
                correo: $("#correo").val(),
                telefono: $("#telefono").val()
            };

            let url = id ? `http://localhost:3000/usuarios/editar/${id}` : "http://localhost:3000/registro";
            let method = id ? "PUT" : "POST";

            try {
                let response = await fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(usuario)
                });

                if (response.ok) {
                    Swal.fire({
                        title: "¡Éxito!",
                        text: id ? "Usuario actualizado con éxito" : "Usuario creado con éxito",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    }).then(() => {
                        $("#usuarioModal").modal("hide");
                        cargarUsuarios();
                    });
                } else {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo guardar el usuario",
                        icon: "error",
                        confirmButtonText: "Aceptar"
                    });
                }
            } catch (error) {
                console.error("Error al guardar usuario:", error);
                Swal.fire({
                    title: "Error",
                    text: "Hubo un problema al guardar el usuario.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
            }
        }


        function editarUsuario(id) {
            let row = $("#userTableBody tr").filter(function () {
                return $(this).find("td:first").text() == id;
            });

            abrirModal(true, id,
                row.find("td:eq(1)").text(),
                row.find("td:eq(2)").text(),
                row.find("td:eq(3)").text(),
                row.find("td:eq(4)").text()
            );
        }

        function logout() {
            window.location.href = "login.html";
        }
