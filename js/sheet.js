function exportarExcel() {
    let tabla = document.getElementById("userTable");
    let filas = tabla.querySelectorAll("tr");

    let datos = [];

    filas.forEach((fila, index) => {
        let filaDatos = [];
        let celdas = fila.querySelectorAll("th, td");

        // Ignorar la última celda de cada fila (Columna Opciones)
        celdas.forEach((celda, i) => {
            if (i < celdas.length - 1) { // Excluir la última columna
                filaDatos.push(celda.innerText);
            }
        });

        datos.push(filaDatos);
    });

    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet(datos);

    XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
    XLSX.writeFile(wb, "usuarios.xlsx");

    Swal.fire({
        title: "Exportación Exitosa",
        text: "El archivo usuarios.xlsx ha sido generado.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
    });
}