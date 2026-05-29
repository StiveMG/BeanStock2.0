import requests

API_DJANGO = "http://127.0.0.1:8000/api/bebidas/"
API_FASTAPI = "http://127.0.0.1:8001/analisis/ventas"

def obtener_datos():
    try:
        respuesta_bebidas = requests.get(API_DJANGO)
        bebidas = respuesta_bebidas.json()
    except:
        bebidas = []

    try:
        respuesta_analisis = requests.get(API_FASTAPI)
        analisis = respuesta_analisis.json()
    except:
        analisis = {}

    return bebidas, analisis

def generar_html(bebidas, analisis):
    html_base = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BeanStock Dashboard</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>BeanStock Analytics</h1>
    </header>
    <main class="contenedor">
        <section class="tarjeta analisis">
            <h2>Análisis de Ventas (IA Microservicio)</h2>
            <div class="dato-destacado">
                <p>Producto Estrella:</p>
                <h3>{top_producto}</h3>
                <p>Total Vendido: {top_ventas} unidades</p>
            </div>
        </section>
        
        <section class="tarjeta inventario">
            <h2>Inventario en Vitrina (Django API)</h2>
            <ul class="lista-bebidas">
                {lista_bebidas}
            </ul>
        </section>
    </main>
</body>
</html>"""

    lista_html = ""
    for b in bebidas:
        nombre = b.get('nombre', 'Desconocido')
        precio = b.get('precio_venta', 0)
        stock = b.get('cantidad', 0)
        lista_html += f"<li><strong>{nombre}</strong> - Precio: ${precio} - Stock Actual: {stock}</li>\n"

    top_producto = analisis.get("producto_estrella", "No hay ventas registradas")
    top_ventas = analisis.get("total_vendido", 0)

    html_final = html_base.format(
        top_producto=top_producto, 
        top_ventas=top_ventas, 
        lista_bebidas=lista_html
    )

    with open("dashboard.html", "w", encoding="utf-8") as file:
        file.write(html_final)
    
    print("El cliente consumio las APIs con exito.")
    print("Archivo 'dashboard.html' generado correctamente.")

if __name__ == "__main__":
    datos_bebidas, datos_analisis = obtener_datos()
    generar_html(datos_bebidas, datos_analisis)