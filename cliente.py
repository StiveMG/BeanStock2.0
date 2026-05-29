import requests

API_FASTAPI = "http://127.0.0.1:8001/analisis/ventas"

def ejecutar_analisis():
    print("Iniciando conexión con el Microservicio de Análisis...")
    try:
        respuesta = requests.get(API_FASTAPI)
        datos = respuesta.json()
        
        print("\n--- REPORTE DE INTELIGENCIA DE NEGOCIO ---")
        print(f"Producto más vendido: {datos.get('producto_estrella')}")
        print(f"Unidades totales desplazadas: {datos.get('total_vendido')}")
        print("------------------------------------------\n")
        
        with open("reporte_analisis.txt", "w", encoding="utf-8") as f:
            f.write("REPORTE AUTOMATIZADO BEANSTOCK\n")
            f.write(f"Producto Estrella: {datos.get('producto_estrella')}\n")
            f.write(f"Total Vendido: {datos.get('total_vendido')}\n")
            
        print("Reporte generado exitosamente en 'reporte_analisis.txt'")
        
    except Exception as e:
        print("Error de conexión. Asegúrate de que FastAPI esté corriendo en el puerto 8001.")

if __name__ == "__main__":
    ejecutar_analisis()