import { useState, useEffect } from "react";
import {
  TextInput,
  Select,
  Checkbox,
  Button,
  Grid,
  Group,
  Title,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconPlus,
  IconClearAll,
  IconArrowsRightLeft,
  IconKey,
  IconBuildingBank,
  IconCurrencyDollar,
  IconCoin,
  IconFileText,
  IconUser,
  IconCreditCard,
  IconNumber123,
  IconClock,
} from "@tabler/icons-react";
import type { DatosTransferencia, NotificationType } from "~/entities/transfer";
import { BANCOS } from "~/shared/lib/bancos";

interface TransferFormProps {
  onAgregar: (datos: DatosTransferencia) => boolean;
  showNotification: (message: string, type: NotificationType) => void;
  currentType?: "mismo-banco" | "spei" | null;
}

function TransferForm({
  onAgregar,
  showNotification,
  currentType = null,
}: TransferFormProps) {
  const form = useForm({
    initialValues: {
      tipoTransferencia: "mismo-banco",
      divisa: "MXN",
      tipoCuenta: "40",
      claveBanco: "",
      referencia: "0000000",
      disponibilidad: "H",
      cuentaOrigen: "",
      cuentaDestino: "",
      monto: "",
      concepto: "",
      clave: "PTC",
      titular: "",
    },
    validate: {
      cuentaOrigen: (value) => (value ? null : "Campo obligatorio"),
      cuentaDestino: (value) => (value ? null : "Campo obligatorio"),
      monto: (value) => (value ? null : "Campo obligatorio"),
      concepto: (value) => (value ? null : "Campo obligatorio"),
      titular: (value, values) =>
        values.tipoTransferencia === "spei" && !value
          ? "Campo obligatorio"
          : null,
      claveBanco: (value, values) =>
        values.tipoTransferencia === "spei" && !value
          ? "Campo obligatorio"
          : null,
    },
  });

  const [usarClave, setUsarClave] = useState<boolean>(false);

  useEffect(() => {
    if (currentType) {
      form.setFieldValue("tipoTransferencia", currentType);
    }
  }, [currentType]);

  const tipoTransferencia = form.values.tipoTransferencia;

  useEffect(() => {
    if (tipoTransferencia === "spei") {
      form.setFieldValue("clave", "PSC");
    } else {
      form.setFieldValue("clave", "PTC");
    }
  }, [tipoTransferencia]);

  const validarSoloNumeros = (value: string): string =>
    value.replace(/\D/g, "");
  const validarAlfanumerico = (value: string): string =>
    value.replace(/[^A-Za-z\s]/g, "").toUpperCase();

  const handleAgregar = (values: typeof form.values) => {
    const datos: DatosTransferencia = {
      tipoTransferencia: values.tipoTransferencia as "mismo-banco" | "spei",
      cuentaOrigen: values.cuentaOrigen,
      cuentaDestino: values.cuentaDestino,
      monto: Number(values.monto),
      concepto: values.concepto || "",
      divisa: values.divisa || "MXN",
    };

    if (usarClave) {
      datos.clave = values.clave;
    }

    if (values.tipoTransferencia === "spei") {
      datos.titular = values.titular || "";
      datos.tipoCuenta = values.tipoCuenta || "40";
      datos.claveBanco = values.claveBanco || "044";
      datos.referencia = values.referencia || "0000000";
      datos.disponibilidad = "H";
    }

    const success = onAgregar(datos);
    if (success) {
      limpiarFormulario();
    }
  };

  const limpiarFormulario = () => {
    const prevTipoTransferencia = form.values.tipoTransferencia;
    form.reset();
    form.setValues({
      referencia: "0000000",
      divisa: "MXN",
      tipoCuenta: "40",
      claveBanco: "",
      disponibilidad: "H",
      tipoTransferencia: currentType || prevTipoTransferencia,
      clave: (currentType || prevTipoTransferencia) === "spei" ? "PSC" : "PTC",
    });
  };

  const handleInvalid = () => {
    showNotification("Completa todos los campos obligatorios", "warning");
  };

  return (
    <Box mb="xl">
      <Title order={4} mb="xl">
        Nueva Transferencia
      </Title>
      <form onSubmit={form.onSubmit(handleAgregar, handleInvalid)}>
        <Select
          label="Tipo de Transferencia"
          data={[
            { value: "mismo-banco", label: "Mismo Banco" },
            { value: "spei", label: "SPEI" },
          ]}
          disabled={!!currentType}
          allowDeselect={false}
          leftSection={<IconArrowsRightLeft size={16} />}
          {...form.getInputProps("tipoTransferencia")}
          mb="sm"
        />

        <Checkbox
          label="Usar clave de transferencia"
          checked={usarClave}
          onChange={(e) => setUsarClave(e.currentTarget.checked)}
          mb="sm"
        />

        {usarClave && (
          <Select
            label="Clave de Transferencia"
            data={
              tipoTransferencia === "spei"
                ? [{ value: "PSC", label: "PSC - Transferencia SPEI" }]
                : [
                    { value: "TNN", label: "TNN - Entre cuentas propias BBVA" },
                    { value: "PTC", label: "PTC - A cuentas BBVA de terceros" },
                  ]
            }
            allowDeselect={false}
            leftSection={<IconKey size={16} />}
            {...form.getInputProps("clave")}
            mb="sm"
          />
        )}

        <Grid gutter="md" mb="sm">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Cuenta Origen (10 o 18 dígitos)"
              placeholder="Ingresa tu número de cuenta origen"
              maxLength={18}
              leftSection={<IconBuildingBank size={16} />}
              {...form.getInputProps("cuentaOrigen")}
              onChange={(e) =>
                form.setFieldValue(
                  "cuentaOrigen",
                  validarSoloNumeros(e.currentTarget.value),
                )
              }
              withAsterisk
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Cuenta Destino (10 o 18 dígitos)"
              placeholder="Ingresa la cuenta de destino"
              maxLength={18}
              leftSection={<IconUser size={16} />}
              {...form.getInputProps("cuentaDestino")}
              onChange={(e) =>
                form.setFieldValue(
                  "cuentaDestino",
                  validarSoloNumeros(e.currentTarget.value),
                )
              }
              withAsterisk
            />
          </Grid.Col>
        </Grid>

        <Grid gutter="md" mb="sm">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Monto"
              type="number"
              placeholder="0.00"
              step="0.01"
              min={0.01}
              leftSection={<IconCurrencyDollar size={16} />}
              {...form.getInputProps("monto")}
              withAsterisk
            />
          </Grid.Col>
          {tipoTransferencia !== "spei" && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Divisa"
                data={[
                  { value: "MXN", label: "MXN" },
                  { value: "USD", label: "USD" },
                  { value: "EUR", label: "EUR" },
                ]}
                allowDeselect={false}
                leftSection={<IconCoin size={16} />}
                {...form.getInputProps("divisa")}
              />
            </Grid.Col>
          )}
        </Grid>

        <TextInput
          label="Concepto (máx. 30 caracteres)"
          placeholder="CONCEPTO DE LA TRANSFERENCIA"
          maxLength={30}
          leftSection={<IconFileText size={16} />}
          {...form.getInputProps("concepto")}
          onChange={(e) =>
            form.setFieldValue(
              "concepto",
              validarAlfanumerico(e.currentTarget.value),
            )
          }
          withAsterisk
          mb="sm"
        />

        {tipoTransferencia === "spei" && (
          <>
            <TextInput
              label="Titular Cuenta Destino (máx. 30 caracteres)"
              placeholder="NOMBRE DEL TITULAR"
              maxLength={30}
              leftSection={<IconUser size={16} />}
              {...form.getInputProps("titular")}
              onChange={(e) =>
                form.setFieldValue(
                  "titular",
                  validarAlfanumerico(e.currentTarget.value),
                )
              }
              withAsterisk
              mb="sm"
            />

            <Grid gutter="md" mb="sm">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Tipo de Cuenta"
                  data={[
                    { value: "03", label: "03 - Tarjeta de Débito" },
                    { value: "40", label: "40 - Cuenta CLABE" },
                    { value: "10", label: "10 - Cuenta Móvil" },
                  ]}
                  allowDeselect={false}
                  leftSection={<IconCreditCard size={16} />}
                  {...form.getInputProps("tipoCuenta")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Clave Banco"
                  placeholder="Selecciona el banco"
                  searchable
                  withAsterisk
                  allowDeselect={false}
                  leftSection={<IconBuildingBank size={16} />}
                  data={Object.entries(BANCOS).map(([code, name]) => ({
                    value: code,
                    label: `${code} - ${name}`,
                  }))}
                  {...form.getInputProps("claveBanco")}
                />
              </Grid.Col>
            </Grid>

            <Grid gutter="md" mb="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Referencia Numérica (7 dígitos)"
                  placeholder="0000000"
                  maxLength={7}
                  leftSection={<IconNumber123 size={16} />}
                  {...form.getInputProps("referencia")}
                  onChange={(e) =>
                    form.setFieldValue(
                      "referencia",
                      validarSoloNumeros(e.currentTarget.value),
                    )
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Disponibilidad"
                  value="H"
                  maxLength={1}
                  readOnly
                  leftSection={<IconClock size={16} />}
                  {...form.getInputProps("disponibilidad")}
                />
              </Grid.Col>
            </Grid>
          </>
        )}

        <Group>
          <Button type="submit" leftSection={<IconPlus size={16} />} size="md">
            Agregar Transferencia
          </Button>
          <Button
            variant="default"
            leftSection={<IconClearAll size={16} />}
            onClick={limpiarFormulario}
            size="md">
            Limpiar Formulario
          </Button>
        </Group>
      </form>
    </Box>
  );
}

export default TransferForm;
