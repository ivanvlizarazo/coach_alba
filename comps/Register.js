import React from "react";
import styles from "../styles/styles.scss";
import Router from "next/router";
import CountrySelector from "../comps/CountrySelector";
import api from "../api";
import {
  Select,
  Form,
  Alert,
  Input,
  Icon,
  Tooltip,
  Button,
  Checkbox
} from "antd";
import NumericInput from "../comps/NumericInput";

const formTailLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8, offset: 4 }
};

class Component_register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      register: {
        name: "",
        email: "",
        phone: null,
        id_phone: null,
        location: {
          country: "",
          state: "",
          city: ""
        },
        password: "",
        password_confirmation: ""
      },

      registerError: {
        locationError: ""
      },

      checkBoxValidate: false,
      checkBoxValidateSubmit: "",
      counter: 0,
      phonecodeItems: [],
      errors: null
    };
    this.countryRef = React.createRef();
    this.errorsRef = React.createRef();
  }

  componentDidMount() {
    const selector = this.countryRef.current;
    this.setState({
      phonecodeItems: selector.state.phonecodeItems
    });
  }

  validateRegister = () => {
    let locationError = "";

    console.log(this.state.register.location);

    if (
      !this.state.register.location.country ||
      !this.state.register.location.state ||
      !this.state.register.location.city
    ) {
      locationError = "Lugar de residencia incompleto";
    }
    if (locationError) {
      this.setState({
        registerError: {
          ...this.state.registerError,

          locationError
        }
      });
      return false;
    }

    return true;
  };

  handleSubmit = event => {
    event.preventDefault();

    this.selector = this.countryRef.current;
    const { country, state, city } = this.selector.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState(
          {
            register: {
              ...this.state.register,
              location: { country, state, city }
            }
          },
          () => {
            const isValid = this.validateRegister();
            if (isValid && this.state.checkBoxValidate) {
              this.setState({
                registerError: {
                  ...this.state.registerError,

                  locationError: ""
                },
                checkBoxValidateSubmit: ""
              });
              const userData = JSON.stringify(this.state.register);
              console.log("userData: ", userData);

              api
                .post(`/api/users/register`, userData, {
                  headers: { "Content-type": "application/json" }
                })

                .then(() => {
                  Router.push("/");
                })
                .catch(err => {
                  console.log(typeof err.response.data.errors);
                  let errors = err.response.data.errors.map(item => {
                    var [key, value] = Object.entries(item)[0];
                    return value;
                  });
                  this.setState(
                    {
                      ...this.state,
                      errors
                    },
                    () =>
                      this.errorsRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                      })
                  );
                });
            }
          }
        );
      }
    });
  };

  noSpaces = word => {
    return word.replace(/\s/g, "");
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(["confirm"], { force: true });
    }
    callback();
  };
  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue("password")) {
      callback("Las contraseñas no coinciden.");
    } else {
      callback();
    }
  };
  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  handleChange = e => {
    this.setState(
      {
        checkNick: e.target.checked
      },
      () => {
        this.props.form.validateFields(["nickname"], { force: true });
      }
    );
  };

  validatePrivacyCheck = (rule, value, callback) => {
    if (value) {
      callback();
    } else {
      callback("Acepta la política de privacidad");
    }
  };

  render() {
    console.log("locationError: ", this.state.registerError.locationError);
    const { getFieldDecorator } = this.props.form;

    const prefixSelector = getFieldDecorator("prefix", {
      initialValue: "Indicativo",
      rules: [{ required: true, message: "Ingresa indicativo" }]
    })(
      <Select
        showSearch
        size="large"
        style={{ minWidth: "10vw" }}
        onChange={value =>
          this.setState({
            register: { ...this.state.register, id_phone: parseInt(value) }
          })
        }
      >
        {this.state.phonecodeItems}
      </Select>
    );
    return (
      <Form
        className={`${styles.login_container}`}
        onSubmit={this.handleSubmit}
      >
        <h3>Registro</h3>
        <div>
          {this.state.errors ? (
            <Alert
              message={this.state.errors.map(line => (
                <div>
                  <ul>
                    <li>
                      <p>{line}</p>
                    </li>
                  </ul>
                </div>
              ))}
              type="error"
              closable
            />
          ) : null}
        </div>

        <Form.Item
          label={
            <span>
              Nombre&nbsp;
              <Tooltip title="Utiliza al menos 3 caracteres y solo usa letras">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
          hasFeedback
        >
          {getFieldDecorator("name", {
            rules: [
              {
                required: true,
                message: "Ingresa tu nombre"
              },
              {
                pattern: /^(?=.{3,100}$)([a-zA-ZäáàëéèíìïöóòúüùñçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ]+[\s(?!\s)]?)*[a-zA-ZäáàëéèíìïöóòúüùñçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ]$/,

                message:
                  "Ingresa un nombre mayor a tres caracteres y sin números"
              }
            ]
          })(
            <Input
              placeholder="Nombre"
              size="large"
              onChange={e => {
                this.setState({
                  register: {
                    ...this.state.register,
                    name: e.target.value
                  }
                });
              }}
            />
          )}
        </Form.Item>
        <Form.Item label="Correo electrónico" hasFeedback>
          {getFieldDecorator("email", {
            rules: [
              {
                type: "email",
                pattern: /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/,
                message:
                  "Ingresa tu correo electrónico con el siguiente formato: nombre@ejemplo.com",
                whitespace: true
              },
              {
                required: true,
                message: "Ingresa tu correo electrónico"
              }
            ]
          })(
            <Input
              placeholder="Correo electrónico"
              size="large"
              onChange={e => {
                this.setState({
                  register: {
                    ...this.state.register,
                    email: this.noSpaces(e.target.value)
                  }
                });
              }}
            />
          )}
        </Form.Item>

        <Form.Item label="Número de celular *">
          {getFieldDecorator("phone", {
            rules: [
              { required: true, message: "Ingresa tu número de celular" },
              {
                pattern: /^[0-9]{10}$/gi,
                message: "El número debe contener 10 dígitos"
              }
            ]
          })(
            <NumericInput
              size="large"
              addonBefore={prefixSelector}
              onChange={value =>
                this.setState({
                  register: {
                    ...this.state.register,
                    phone: parseInt(value, 10)
                  }
                })
              }
              placeholder="Ej: 1234567890"
              style={{
                backgroundColor: "#fff",
                borderColor: "#fff",
                borderRadius: 10
              }}
            />
          )}
        </Form.Item>
        <Form.Item label="Lugar de residencia">
          {getFieldDecorator("places", {
            rules: [
              {
                required: true,
                message: "Ingresa tu lugar de residencia"
              }
            ]
          })(<CountrySelector ref={this.countryRef}></CountrySelector>)}
        </Form.Item>

        <Form.Item
          label={
            <span>
              Contraseña&nbsp;
              <Tooltip title="Utiliza al menos 6 caracteres">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
          hasFeedback
        >
          {getFieldDecorator("password", {
            rules: [
              {
                required: true,
                pattern: /^[a-zA-Z0-9äáàëéèíìïöóòúüùñçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ!@#\$%\^&\*\?]{6,100}$/,
                message: "Contraseña no válida.",
                whitespace: true
              },

              { validator: this.validateToNextPassword }
            ]
          })(
            <Input.Password
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              size="large"
              placeholder="Contraseña"
              onChange={e => {
                this.setState({
                  register: {
                    ...this.state.register,
                    password: this.noSpaces(e.target.value)
                  }
                });
              }}
            />
          )}
        </Form.Item>

        <Form.Item label="Confirmar contraseña" hasFeedback>
          {getFieldDecorator("confirm", {
            rules: [
              {
                required: true,
                message: "Ingresa la confirmación de contraseña"
              },

              { validator: this.compareToFirstPassword }
            ]
          })(
            <Input.Password
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              size="large"
              placeholder="Contraseña"
              onChange={e => {
                this.setState({
                  register: {
                    ...this.state.register,
                    password_confirmation: this.noSpaces(e.target.value)
                  }
                });
              }}
              onBlur={this.handleConfirmBlur}
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator("agreement", {
            valuePropName: "checked",
            rules: [{ validator: this.validatePrivacyCheck }]
          })(
            <Checkbox style={{ color: "#000" }}>
              Acepto la{" "}
              <a
                href="/"
                style={{ color: "#5CE707", fontWeight: "bold" }}
                target="_blank"
              >
                política de privacidad
              </a>
            </Checkbox>
          )}
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          className={styles.btnSubmit}
        >
          Registrarme
        </Button>
      </Form>
    );
  }
}

const Register = Form.create({ name: "register" })(Component_register);
export default Register;
