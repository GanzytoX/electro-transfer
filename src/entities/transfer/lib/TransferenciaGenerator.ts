import type { DatosTransferencia } from "../model/types";

export class TransferenciaGenerator {
  static limpiarTexto(texto: string): string {
    if (!texto) return "";

    texto = texto.toUpperCase();
    const replacements = {
      Á: "A",
      É: "E",
      Í: "I",
      Ó: "O",
      Ú: "U",
      Ñ: "N",
      Ü: "U",
      á: "A",
      é: "E",
      í: "I",
      ó: "O",
      ú: "U",
      ñ: "N",
      ü: "U",
    };

    for (const [old, newChar] of Object.entries(replacements)) {
      texto = texto.replace(new RegExp(old, "g"), newChar);
    }

    texto = texto.replace(/[@*$(),¿?&]/g, "");
    return texto;
  }

  static formatearMonto(monto: number | string): string {
    const montoStr = parseFloat(String(monto)).toFixed(2);
    return montoStr.padStart(16, "0");
  }

  static formatearCuenta(
    cuenta: string | number,
    longitud: number = 18,
  ): string {
    cuenta = String(cuenta).trim();
    if (cuenta.length === 10) {
      return "00000000" + cuenta;
    } else if (cuenta.length === 18) {
      return cuenta;
    }
    return cuenta.padStart(longitud, "0");
  }

  static generarMismoBanco(datos: DatosTransferencia): string {
    const clave = datos.clave || "";
    const cuentaDestino = this.formatearCuenta(datos.cuentaDestino);
    const cuentaOrigen = this.formatearCuenta(datos.cuentaOrigen);
    const divisa = (datos.divisa || "MXN").toUpperCase().substring(0, 3);
    const monto = this.formatearMonto(datos.monto);
    const concepto = this.limpiarTexto(datos.concepto)
      .substring(0, 30)
      .padEnd(30, " ");

    if (clave) {
      return `${clave}${cuentaDestino}${cuentaOrigen}${divisa}${monto}${concepto}`;
    }
    return `${cuentaDestino}${cuentaOrigen}${divisa}${monto}${concepto}`;
  }

  static generarSPEI(datos: DatosTransferencia): string {
    const clave = datos.clave || "";
    const cuentaDestino = this.formatearCuenta(datos.cuentaDestino);
    const cuentaOrigen = this.formatearCuenta(datos.cuentaOrigen);
    const divisa = "MXN";
    const monto = this.formatearMonto(datos.monto);
    const titular = this.limpiarTexto(datos.titular || "")
      .substring(0, 30)
      .padEnd(30, " ");
    const tipoCuenta = String(datos.tipoCuenta || "40").padStart(2, "0");
    const claveBanco = String(datos.claveBanco || "044").padStart(3, "0");
    const concepto = this.limpiarTexto(datos.concepto)
      .substring(0, 30)
      .padEnd(30, " ");
    const referencia = String(datos.referencia || "0").padStart(7, "0");
    const disponibilidad = datos.disponibilidad || "H";

    if (clave) {
      return `${clave}${cuentaDestino}${cuentaOrigen}${divisa}${monto}${titular}${tipoCuenta}${claveBanco}${concepto}${referencia}${disponibilidad}`;
    }
    return `${cuentaDestino}${cuentaOrigen}${divisa}${monto}${titular}${tipoCuenta}${claveBanco}${concepto}${referencia}${disponibilidad}`;
  }
}
