AJUSTES EN ORDEN DE PRIORIDAD

1. UTILS

    - **WIP** simplifica lo que cada util hace, preferentemente una unica cosa (atomic)

    - dejar claro cuales son los tipos de entrada y salida esperados para cada utilidad.

    - ajustar los testes unitarios para testar todos los escenarios
    posibles de retorno de cada funcion util.


2. LIBS

   - dejar claro los tipos de entradas y salida para cada lib method
   - simpplificar lo qu cada metodo de la lib hace.
   - ajustar testes unitarios para cada método de la lib.


3. ELIMINAR EL USO DE "ANY"

    - quitar toda referencia a un tipo de dato any y reemplazar por unknown
    - quitar permiso para "any" buscando: @typescript-eslint/no-explicit-any