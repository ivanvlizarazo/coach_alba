import React, { Component, useRef, useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import Files from "../../../comps/Files";
import api from "../../../api";
import styles from "../../../styles/styles.scss";
import {
  Collapse,
  Button,
  Form,
  Input,
  Row,
  Col,
  Card,
  Typography,
  Alert,
  message,
  Skeleton
} from "antd";
import ReactHtmlParser from "react-html-parser";
import Cookies from "js-cookie";

const { Text, Title } = Typography;
const { Panel } = Collapse;

function EditPost(props) {
  const { user } = props;
  const router = useRouter();
  const fileRef = useRef(null);
  const editorRef = useRef();
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const [error, setError] = useState(null);
  const [errorDescription, setErrorDescription] = useState(null);
  const [first, setFirst] = useState(false);
  const [id, setId] = useState(null);
  const { CKEditor, DecoupledEditor } = editorRef.current || {};
  const { getFieldDecorator } = props.form;

  useEffect(() => {
    editorRef.current = {
      CKEditor: require("@ckeditor/ckeditor5-react"),
      DecoupledEditor: require("@ckeditor/ckeditor5-build-decoupled-document")
    };

    setEditorLoaded(true);
  }, []);

  function handleSubmit(event, fileRef) {
    const file = fileRef.current.state.selectedFile;
    !file ? setError("Ingresa un archivo") : setError(null);
    !description
      ? setErrorDescription("Ingresa el enunciado del post")
      : setErrorDescription(null);

    event.preventDefault();
    props.form.validateFieldsAndScroll((err, values) => {
      console.log(
        "values: ",
        values,
        "  description: ",
        description,
        "user.id: ",
        user.id,
        "file: ",
        file
      );
      if (!err && file && description) {
        let postData = new FormData();
        postData.append("picture", file);
        postData.append("title", values.title);
        console.log("postData: ", postData.get("title"));
        postData.append("description", description);
        postData.append("owner", user.id);
        const csrftoken = Cookies.get("csrftoken");
        api
          .put(`/api/post/${id}/`, postData, {
            headers: {
              "Content-type": "multipart/form-data",
              "X-CSRFToken": csrftoken
            }
          })
          .then(res => {
            message.config({
              top: 90
            });
            message.success("Publicación editada correctamente.", 5);

            Router.push("/post/[id]", `/post/${res.data.id}`);
          })
          .catch(err => {
            setError(err);
          });
      }
    });
  }

  function onClose() {
    setError(null);
  }
  function onCloseDescription() {
    setErrorDescription(null);
  }

  function loadData() {
    api.get(`/api/post/${router.query.id}`).then(res => {
      // src: "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png",
      // setSrc(res.data.picture);
      setTitle(res.data.title);
      setDescription(res.data.description);
      setId(res.data.id);
      setFirst(true);
    });
  }

  return first ? (
    <Form onSubmit={e => handleSubmit(e, fileRef)}>
      <Row>
        <Col className=" offset-sm-1 offset-md-1 offset-lg-1 offset-xl-1 col-12 col-sm-10 col-md-10 col-lg-10 col-xl-10">
          <Card
            style={{
              marginTop: "2rem",
              marginBottom: "2rem",
              boxShadow:
                " 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 9px 26px 0 rgba(0, 0, 0, 0.9)",
              borderRadius: "10px"
            }}
          >
            <Row justify="center" type="flex">
              <Title level={2}>Publicación</Title>
            </Row>

            <Row justify="center" type="flex">
              <Form.Item>
                <Files ref={fileRef}></Files>
                {error ? (
                  <Alert
                    message={error}
                    type="error"
                    closable
                    onClose={() => onClose()}
                  />
                ) : null}
              </Form.Item>
            </Row>
            <Row>
              <Col
                className="gutter-row"
                className="offset-sm-1 offset-md-1 offset-lg-1 offset-xl-2 col-12 col-sm-5 col-md-7 col-lg-5 col-xl-5"
              >
                <Form.Item label="Título de la publicación">
                  {getFieldDecorator("title", {
                    rules: [
                      {
                        required: true,

                        message: "Ponle un título a tu publicación",
                        type: "string"
                      },
                      {
                        pattern: /^(?=.{1,1000}$)([a-zA-Z0-9äáàëéèíìïöóòúüùñçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ,.¿]+[\s(?!\s)]?)*[a-zA-Z0-9äáàëéèíìïöóòúüùñçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ,.?]$/,
                        message: "Título no válido"
                      }
                    ],
                    initialValue: title
                  })(<Input placeholder="Título" size="large"></Input>)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col
                className="gutter-row"
                className="offset-sm-1 offset-md-1 offset-lg-1 offset-xl-2 col-12 col-sm-8 col-md-10 col-lg-10 col-xl-8"
              >
                <Form.Item label="Descripción de la publicación">
                  {editorLoaded ? (
                    <div>
                      <div id="toolbar-container"></div>
                      <CKEditor
                        onInit={editor => {
                          // Add the toolbar to the container

                          const toolbarContainer = document.querySelector(
                            "#toolbar-container"
                          );
                          toolbarContainer.appendChild(
                            editor.ui.view.toolbar.element,
                            editor.ui.view.editable.element
                          );

                          window.editor = editor;
                          // You can store the "editor" and use when it is needed.
                          console.log("Editor is ready to use!", editor);
                        }}
                        config={{
                          toolbar: [
                            "Heading",
                            "|",
                            "fontFamily",
                            "fontSize",
                            "fontColor",
                            "fontBackgroundColor",
                            "|",
                            "bold",
                            "italic",
                            "underline",
                            "strikethrough",
                            "|",
                            "bulletedList",

                            "numberedList",
                            "|",
                            "alignment",
                            "link"
                            // "undo",
                            // "redo"
                          ],
                          fontSize: {
                            options: [9, 11, 13, "default", 17, 19, 21]
                          },
                          heading: {
                            options: [
                              {
                                model: "paragraph",
                                title: "Párrafo",
                                class: "ck-heading_paragraph"
                              },
                              {
                                model: "heading1",
                                view: "h1",
                                title: "Título 1",
                                class: "ck-heading_heading1"
                              },
                              {
                                model: "heading2",
                                view: "h2",
                                title: "Titulo 2",
                                class: "ck-heading_heading2"
                              },
                              {
                                model: "heading3",
                                view: "h3",
                                title: "Titulo 3",
                                class: "ck-heading_heading3"
                              }
                            ]
                          },

                          removePlugins: [
                            "ImageUpload",
                            "MediaEmbed",
                            "BlockQuote",
                            "IncreaseIndent"
                          ],

                          isReadOnly: true
                        }}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setDescription(data);
                          setErrorDescription(null);
                        }}
                        data={description}
                        editor={DecoupledEditor}
                      />
                    </div>
                  ) : (
                    <div>Cargando... </div>
                  )}
                  {errorDescription ? (
                    <Alert
                      message={errorDescription}
                      type="error"
                      closable
                      onClose={() => onCloseDescription()}
                    />
                  ) : null}
                </Form.Item>

                <div>
                  <Collapse accordion style={{ wordWrap: "break-word" }}>
                    <Panel
                      header={`Vista previa del texto`}
                      key={`Vista previa`}
                      className={styles.panel}
                    >
                      <Row
                        justify="center"
                        type="flex"
                        style={{ paddingTop: "20px" }}
                      >
                        <Title>{props.form.getFieldValue("title")}</Title>
                      </Row>

                      <Row justify="center">
                        <Col
                          className="gutter-row"
                          // className="offset-1 offset-sm-1 offset-md-1 offset-lg-1 offset-xl-2 col-10 col-sm-8 col-md-10 col-lg-10 col-xl-8"
                        >
                          <Text>{ReactHtmlParser(description)}</Text>
                        </Col>
                      </Row>
                    </Panel>
                  </Collapse>
                </div>
              </Col>
            </Row>
            <br />
            <Row justify="center" type="flex">
              <Button htmlType="submit" type="primary">
                Subir publicación
              </Button>
            </Row>
          </Card>
        </Col>
      </Row>
    </Form>
  ) : (
    <div className="container">
      <Skeleton active>{first == false ? loadData() : null}</Skeleton>
    </div>
  );
}
const Edit = Form.create({ name: "edit" })(EditPost);
export default Edit;
