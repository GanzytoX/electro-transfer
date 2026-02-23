import type { DatosTransferencia } from "../model/types";

export class TransferenciaGenerator {
  static limpiarTexto(texto: string): string {
    if (!texto) return "";
    texto = texto.toUpperCase();

    const replacements: Record<string, string> = {
      Á: "A",
      É: "E",
      Í: "I",
      Ó: "O",
      Ú: "U",
      Ñ: "N",
      Ü: "U",
    };

    for (const [old, newChar] of Object.entries(replacements)) {
      texto = texto.replace(new RegExp(old, "g"), newChar);
    }

    texto = texto.replace(/[@*$(),¿?&]/g, "");
    return texto;
  }

  static formatearMonto(monto: number | string): string {
    return parseFloat(String(monto)).toFixed(2).padStart(16, "0");
  }

  static formatearCuenta(
    cuenta: string | number,
    longitud: number = 18,
  ): string {
    cuenta = String(cuenta).trim();
    if (cuenta.length === 10) return "00000000" + cuenta;
    if (cuenta.length === 18) return cuenta;
    return cuenta.padStart(longitud, "0");
  }

  private static buildBase(datos: DatosTransferencia) {
    return {
      clave: datos.clave || "",
      cuentaDestino: this.formatearCuenta(datos.cuentaDestino),
      cuentaOrigen: this.formatearCuenta(datos.cuentaOrigen),
      monto: this.formatearMonto(datos.monto),
      concepto: this.limpiarTexto(datos.concepto)
        .substring(0, 30)
        .padEnd(30, " "),
    };
  }

  static generarMismoBanco(datos: DatosTransferencia): string {
    const { clave, cuentaDestino, cuentaOrigen, monto, concepto } =
      this.buildBase(datos);
    const divisa = (datos.divisa || "MXN").toUpperCase().substring(0, 3);
    const linea = `${cuentaDestino}${cuentaOrigen}${divisa}${monto}${concepto}`;
    return clave ? `${clave}${linea}` : linea;
  }

  static generarSPEI(datos: DatosTransferencia): string {
    const { clave, cuentaDestino, cuentaOrigen, monto, concepto } =
      this.buildBase(datos);
    const titular = this.limpiarTexto(datos.titular || "")
      .substring(0, 30)
      .padEnd(30, " ");
    const tipoCuenta = String(datos.tipoCuenta || "40").padStart(2, "0");
    const claveBanco = String(datos.claveBanco || "044").padStart(3, "0");
    const referencia = String(datos.referencia || "0").padStart(7, "0");
    const disponibilidad = datos.disponibilidad || "H";
    const linea = `${cuentaDestino}${cuentaOrigen}MXN${monto}${titular}${tipoCuenta}${claveBanco}${concepto}${referencia}${disponibilidad}`;
    return clave ? `${clave}${linea}` : linea;
  }
}
