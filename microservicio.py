from fastapi import FastAPI
import sqlite3
import pandas as pd
import os

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "db.sqlite3")

def obtener_datos_ventas():
    conn = sqlite3.connect(DB_PATH)
    query = """
    SELECT inventario_bebida.nombre, SUM(inventario_venta.cantidad_vendida) as total
    FROM inventario_venta
    JOIN inventario_bebida ON inventario_venta.bebida_id = inventario_bebida.id_producto
    GROUP BY inventario_bebida.nombre
    """
    try:
        df = pd.read_sql_query(query, conn)
    except Exception:
        df = pd.DataFrame()
    conn.close()
    return df

@app.get("/analisis/ventas")
def analisis_ventas():
    df = obtener_datos_ventas()
    
    if df.empty:
        return {
            "producto_estrella": "N/A",
            "total_vendido": 0,
            "datos_completos": []
        }
    
    bebida_top = df.loc[df["total"].idxmax()]
    
    return {
        "producto_estrella": str(bebida_top["nombre"]),
        "total_vendido": int(bebida_top["total"]),
        "datos_completos": df.to_dict(orient="records")
    }