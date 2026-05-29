Funcionalidades de Control de Inventario:


Identificación de Insumos: Registro de materias primas con validación de unidades (Gramos/Mililitros).  

Gestión de Producción: Mapeo de recetas mediante diccionarios para transformar insumos en productos terminados, evitando saldos negativos mediante bloques try/except.

Control de Ventas: Registro de salida de bebidas preparadas con actualización automática del stock de vitrina.

Definición de Clases del Sistema:


Insumo: Representa la materia prima heredando de la clase base.  


Bebida: Representa el producto final para la venta.  

Produccion: Clase lógica que gestiona la transformación de ingredientes según el manual (receta).

Venta: Clase que registra la transacción final con el usuario.
