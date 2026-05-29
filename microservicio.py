from fastapi import FastAPI
import sqlite3
import pandas as pd

app = FastAPI()

def obtener_datos_ventas():
    conn = sqlite3.connect("db.sqlite3")
    query = """
    SELECT inventario_bebida.nombre, inventario_venta.cantidad_vendida
    FROM inventario_venta
    JOIN inventario_bebida ON inventario_venta.bebida_id = inventario_bebida.id
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
            "producto_estrella": "Sin datos",
            "total_vendido": 0,
            "datos_completos": []
        }
    
    resumen = df.groupby("nombre")["cantidad_vendida"].sum().reset_index()
    bebida_top = resumen.loc[resumen["cantidad_vendida"].idxmax()]
    
    return {
        "producto_estrella": bebida_top["nombre"],
        "total_vendido": int(bebida_top["cantidad_vendida"]),
        "datos_completos": resumen.to_dict(orient="records")
    }