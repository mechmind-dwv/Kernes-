# Politica de Seguridad

## Versiones soportadas

| Version | Soportada          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reportar vulnerabilidades

Si descubres una vulnerabilidad de seguridad en Kernes:

1. **NO abras un issue publico**
2. Envianos un email a: security@kernes.org
3. Cifra tu mensaje usando nuestra clave PGP (disponible en /security/pgp-key.asc)
4. Incluye:
   - Descripcion detallada de la vulnerabilidad
   - Pasos para reproducir
   - Impacto estimado
   - Posible solucion (si la conoces)

## Respuesta esperada

- Confirmacion de recepcion en 48 horas
- Evaluacion inicial en 7 dias
- Correccion y release en 30-90 dias (dependiendo de la gravedad)
- Creditos publicos al descubridor (si desea)

## Bug Bounty

Ofrecemos recompensas por vulnerabilidades validas:
- Critica: $gracias, gracias, gracias, gracias
- Alta: $gracias, gracias, gracias
- Media: $gracias, gracias
- Baja: $gracias

Ver /security/BUG-BOUNTY.md para detalles.

## Medidas de seguridad del proyecto

- Builds reproducibles y firmados con Ed25519
- Auditorias de seguridad por terceros cada 6 meses
- Procesamiento local-first: datos nunca en servidores
- Zero-trust architecture
- Dependencias auditadas automaticamente
