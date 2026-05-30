import requests
from fpdf import FPDF
from datetime import datetime

API_FASTAPI = "http://127.0.0.1:8001/analisis/ventas"

class PDFReporte(FPDF):
    def header(self):
        self.set_fill_color(74, 59, 50)
        self.rect(0, 0, 210, 30, 'F')
        self.set_font("Arial", 'B', 20)
        self.set_text_color(255, 255, 255)
        self.cell(0, 20, "REPORTE EJECUTIVO DE VENTAS", ln=True, align='C')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", 'I', 8)
        self.set_text_color(128)
        self.cell(0, 10, f"Generado el {datetime.now().strftime('%d/%m/%Y %H:%M')}", align='C')

def ejecutar_analisis():
    try:
        respuesta = requests.get(API_FASTAPI)
        datos = respuesta.json()
        
        pdf = PDFReporte()
        pdf.add_page()
        
        pdf.set_text_color(74, 59, 50)
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, "RESUMEN DE DESEMPEÑO", ln=True)
        pdf.set_font("Arial", '', 12)
        pdf.cell(0, 8, f"Producto Estrella: {datos.get('producto_estrella')}", ln=True)
        pdf.cell(0, 8, f"Unidades Desplazadas: {datos.get('total_vendido')}", ln=True)
        
        pdf.ln(10)
        pdf.set_font("Arial", 'B', 12)
        pdf.set_fill_color(220, 220, 220)
        pdf.cell(100, 10, "Producto", 1, 0, 'C', True)
        pdf.cell(90, 10, "Unidades Vendidas", 1, 1, 'C', True)
        
        pdf.set_font("Arial", '', 12)
        for item in datos.get("datos_completos", []):
            pdf.cell(100, 10, str(item['nombre']), 1)
            pdf.cell(90, 10, str(item['total']), 1, 1, 'C')
            
        pdf.output("reporte_analisis.pdf")
        print("El reporte 'reporte_analisis.pdf' ha sido generado con éxito.")
        
    except Exception as e:
        print(f"Error: Asegúrate de tener FastAPI activo en el puerto 8001. Detalle: {e}")

if __name__ == "__main__":
    ejecutar_analisis()