# Calculadora AASHTO 1993

Aplicativo web local para el diseño y verificación de pavimento flexible mediante el método AASHTO 1993. Fue generado a partir del archivo Excel `Libro1.xlsx`, hoja `Calculadora_AASHTO`.

## Qué incluye

- Cálculo automático del número estructural requerido, `SN`.
- Entrada de parámetros de diseño: `W18`, confiabilidad, desviación estándar, serviciabilidad, `CBR` o `Mr` directo.
- Cálculo de `Mr` desde `CBR` usando las correlaciones del Excel.
- Evaluación de 10 alternativas de espesores.
- Selección automática de la alternativa óptima que cumple con el menor exceso sobre el `SN` requerido.
- Visualización de la sección de pavimento seleccionada.
- Tablas de referencia para coeficientes estructurales, drenaje, confiabilidad y serviciabilidad.
- Botón de reporte para imprimir o guardar como PDF desde el navegador.

## Cómo abrirlo

Si el servidor local sigue activo, abre:

```text
http://127.0.0.1:8765/index.html
```

También puedes abrir directamente el archivo:

```text
C:\Users\DAVILES.LENOVO\Documents\Codex\2026-06-30\gen\outputs\aashto-webapp\index.html
```

## Cómo levantar el servidor local

Desde PowerShell:

```powershell
cd "C:\Users\DAVILES.LENOVO\Documents\Codex\2026-06-30\gen\outputs\aashto-webapp"
python -m http.server 8765 --bind 127.0.0.1
```

Luego abre:

```text
http://127.0.0.1:8765/index.html
```

## Estructura de archivos

```text
aashto-webapp/
  index.html   Interfaz principal
  styles.css   Estilos visuales y diseño responsive
  app.js       Lógica de cálculo AASHTO y actualización de resultados
  README.md    Documentación del aplicativo
```

## Fórmula base

El cálculo implementa la ecuación AASHTO 1993:

```text
log10(W18) = ZR·So + 9.36·log10(SN+1) - 0.20
            + log10(ΔPSI/2.7)/(0.4 + 1094/(SN+1)^5.19)
            + 2.32·log10(Mr) - 8.07
```

El valor de `SN` se obtiene mediante iteración de punto fijo, siguiendo la lógica del Excel original.

## Notas

- La aplicación funciona sin internet y no requiere librerías externas.
- Los valores iniciales replican los datos del Excel recibido.
- Las alternativas pueden editarse directamente desde la tabla.
- El botón `Restaurar` devuelve todos los parámetros a los valores originales del Excel.
