import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Row,
  Col,
  Space,
  Typography,
  theme,
} from "antd";
import { PlusOutlined, ClearOutlined } from "@ant-design/icons";
import type {
  DatosTransferencia,
  NotificationType,
} from "~/entities/transfer/model/types";

const { Option } = Select;
const { Title } = Typography;
const { useToken } = theme;

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
  const { token } = useToken();
  const [form] = Form.useForm();
  const [tipoTransferencia, setTipoTransferencia] = useState<
    "mismo-banco" | "spei"
  >("mismo-banco");

  useEffect(() => {
    if (currentType) {
      setTipoTransferencia(currentType);
      form.setFieldsValue({ tipoTransferencia: currentType });
    }
  }, [currentType, form]);

  const [usarClave, setUsarClave] = useState<boolean>(false);
  const [clave, setClave] = useState<string>("PTC");

  const validarSoloNumeros = (value: string): string =>
    value.replace(/\D/g, "");
  const validarAlfanumerico = (value: string): string =>
    value.replace(/[^A-Za-z0-9\s]/g, "");

  useEffect(() => {
    if (tipoTransferencia === "spei") {
      setClave("PSC");
      form.setFieldsValue({ clave: "PSC" });
    } else {
      setClave("PTC");
      form.setFieldsValue({ clave: "PTC" });
    }
  }, [tipoTransferencia, form]);

  const handleAgregar = () => {
    form
      .validateFields()
      .then((values) => {
        const datos: DatosTransferencia = {
          tipoTransferencia,
          cuentaOrigen: values.cuentaOrigen,
          cuentaDestino: values.cuentaDestino,
          monto: values.monto,
          concepto: values.concepto || "",
          divisa: values.divisa || "MXN",
        };

        if (usarClave) {
          datos.clave = clave;
        }

        if (tipoTransferencia === "spei") {
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
      })
      .catch(() => {
        showNotification("Completa todos los campos obligatorios", "warning");
      });
  };

  const limpiarFormulario = () => {
    form.resetFields();
    form.setFieldsValue({
      referencia: "0000000",
      divisa: "MXN",
      tipoCuenta: "40",
      claveBanco: "044",
      disponibilidad: "H",
    });
    // No mostrar notificación adicional, ya se mostró "Transferencia agregada"
  };

  return (
    <div style={{ marginBottom: "32px" }}>
      <Title level={4} style={{ marginBottom: "32px", color: token.colorText }}>
        Nueva Transferencia
      </Title>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          tipoTransferencia: "mismo-banco",
          divisa: "MXN",
          tipoCuenta: "40",
          claveBanco: "044",
          referencia: "0000000",
          disponibilidad: "H",
        }}>
        {/* Tipo de Transferencia */}
        <Form.Item label="Tipo de Transferencia" name="tipoTransferencia">
          <Select
            disabled={!!currentType}
            value={tipoTransferencia}
            onChange={(value) =>
              setTipoTransferencia(value as "mismo-banco" | "spei")
            }>
            <Option value="mismo-banco">Mismo Banco</Option>
            <Option value="spei">SPEI</Option>
          </Select>
        </Form.Item>

        {/* Usar Clave */}
        <Form.Item>
          <Checkbox
            checked={usarClave}
            onChange={(e) => setUsarClave(e.target.checked)}>
            Usar clave de transferencia
          </Checkbox>
        </Form.Item>

        {usarClave && (
          <Form.Item label="Clave de Transferencia" name="clave">
            <Select value={clave} onChange={setClave}>
              {tipoTransferencia === "spei" ? (
                <Option value="PSC">PSC - Transferencia SPEI</Option>
              ) : (
                <>
                  <Option value="TNN">TNN - Entre cuentas propias BBVA</Option>
                  <Option value="PTC">PTC - A cuentas BBVA de terceros</Option>
                </>
              )}
            </Select>
          </Form.Item>
        )}

        {/* Datos de la Transferencia */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Cuenta Origen (10 o 18 dígitos)"
              name="cuentaOrigen"
              rules={[
                { required: true, message: "Campo obligatorio" },
                { max: 18, message: "Máximo 18 dígitos" },
              ]}>
              <Input
                placeholder="Ingresa tu número de cuenta origen"
                maxLength={18}
                onChange={(e) => {
                  const value = validarSoloNumeros(e.target.value);
                  form.setFieldsValue({ cuentaOrigen: value });
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Cuenta Destino (10 o 18 dígitos)"
              name="cuentaDestino"
              rules={[
                { required: true, message: "Campo obligatorio" },
                { max: 18, message: "Máximo 18 dígitos" },
              ]}>
              <Input
                placeholder="Ingresa la cuenta de destino"
                maxLength={18}
                onChange={(e) => {
                  const value = validarSoloNumeros(e.target.value);
                  form.setFieldsValue({ cuentaDestino: value });
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Monto"
              name="monto"
              rules={[{ required: true, message: "Campo obligatorio" }]}>
              <Input type="number" placeholder="0.00" step="0.01" min="0.01" />
            </Form.Item>
          </Col>
          {tipoTransferencia !== "spei" && (
            <Col xs={24} md={12}>
              <Form.Item label="Divisa" name="divisa">
                <Select>
                  <Option value="MXN">MXN</Option>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>

        <Form.Item label="Concepto (máx. 30 caracteres)" name="concepto">
          <Input
            placeholder="Concepto de la transferencia"
            maxLength={30}
            onChange={(e) => {
              const value = validarAlfanumerico(e.target.value);
              form.setFieldsValue({ concepto: value });
            }}
          />
        </Form.Item>

        {/* Datos Adicionales SPEI */}
        {tipoTransferencia === "spei" && (
          <>
            <Form.Item
              label="Titular Cuenta Destino (máx. 30 caracteres)"
              name="titular">
              <Input
                placeholder="NOMBRE DEL TITULAR"
                maxLength={30}
                onChange={(e) => {
                  const value = validarAlfanumerico(e.target.value);
                  form.setFieldsValue({ titular: value });
                }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Tipo de Cuenta" name="tipoCuenta">
                  <Select>
                    <Option value="03">03 - Tarjeta de Débito</Option>
                    <Option value="40">40 - Cuenta CLABE</Option>
                    <Option value="10">10 - Cuenta Móvil</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Clave Banco" name="claveBanco">
                  <Select>
                    <Option value="044">044 - SCOTIABANK</Option>
                    <Option value="012">012 - BBVA MEXICO</Option>
                    <Option value="014">014 - SANTANDER</Option>
                    <Option value="072">072 - BANORTE</Option>
                    <Option value="002">002 - BANAMEX</Option>
                    <Option value="021">021 - HSBC</Option>
                    <Option value="036">036 - INBURSA</Option>
                    <Option value="127">127 - AZTECA</Option>
                    <Option value="132">132 - MULTIVA BANCO</Option>
                    <Option value="133">133 - ACTINVER</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Referencia Numérica (7 dígitos)"
                  name="referencia">
                  <Input
                    placeholder="0000000"
                    maxLength={7}
                    onChange={(e) => {
                      const value = validarSoloNumeros(e.target.value);
                      form.setFieldsValue({ referencia: value });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Disponibilidad" name="disponibilidad">
                  <Input value="H" maxLength={1} readOnly />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* Botones */}
        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAgregar}
              size="large">
              Agregar Transferencia
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={limpiarFormulario}
              size="large">
              Limpiar Formulario
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

export default TransferForm;
