# TejeConMedida

Calculadoras estáticas para convertir una muestra de punto o ganchillo en tensión, puntos, vueltas y medidas finales.

## Desarrollo

- `npm run verify`: sintaxis, compilación, pruebas y referencias locales.
- `npm run serve`: servidor local desde `dist/`.

La web está preparada para GitHub Pages bajo `/teje-con-medida/`. No necesita backend ni cuenta de usuario.

## Alcance de V1

- normalizar una muestra a 10 cm;
- calcular puntos y vueltas para una pieza rectangular;
- respetar múltiplos de motivo y puntos adicionales;
- adaptar un tramo rectangular entre dos tensiones;
- guardar localmente el último cálculo.

No genera patrones completos, no calcula prendas con forma ni estima consumo de hilo sin una muestra de peso fiable.
