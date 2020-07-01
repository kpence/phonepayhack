import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import firebase from "firebase/app";
import "bootstrap/dist/css/bootstrap.min.css";
import ItemsListForm from "./ItemsListForm";

class MerchantInvoice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      businessName: "",
      businessEmail: "",
      additionalMessage: "",
      idToken: "",
      alias: "",
      errorMessage: "",
      items: [{ desc: "", amount: "" }],
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleItemsChange = this.handleItemsChange.bind(this);
  }

  componentDidMount() {
    console.log("mount");
    let that = this;
    firebase
      .auth()
      .currentUser.getIdToken(/* forceRefresh */ true)
      .then((idToken) => {
        // Send token to your backend via HTTPS
        // ...
        that.setState({ idToken: idToken });

        // check if merchant doc exists
        const url = "https://kylepence.dev:5000/merchants";
        fetch(url, {
          method: "GET",
          headers: { Authorization: idToken },
        }).then((result) => {
          console.log(result);
          // do something with the result
          result.json().then((data) => {
            console.log(data);
            const docExists = data.result.docExists.toLowerCase() === "true";
            if (!docExists) {
              this.props.history.push("/merchantform");
            }
          });
        });
      })
      .catch(function (error) {
        // Handle error
        console.error(error);
      });
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  handleItemsChange(_items) {
    this.setState({ items: _items });
  }

  handleSubmit(e) {
    e.preventDefault();
    const myProps = {
      merchantToken: this.state.idToken,
      businessName: this.state.businessName,
      email: this.state.businessEmail,
      items: this.state.items,
    };
    const url = "https://kylepence.dev:5000/invoices";

    const baseErrorMessage = {
      businessName: "",
      email: "",
      items: {},
    };

    const that = this;

    fetch(url, {
      method: "POST",
      body: JSON.stringify(myProps),
      headers: { Authorization: this.state.idToken },
    }).then((result) => {
      console.log(result);
      // do something with the result
      result.json().then((data) => {
        console.log(data);
        console.log(data.result.invoiceCode);
        let errorMessage = null;
        if (data.status === "fail") {
          errorMessage = { ...baseErrorMessage, ...data.result.errorMessage };
        }
        that.setState({
          alias: data.result.invoiceCode,
          errorMessage: errorMessage,
        });
      });
    });
  }

  render() {
    // Set the error field class names
    const getFormClass = (attr) => {
      let err = this.state.errorMessage;
      return !err || !err[attr] || err[attr] === ""
        ? ""
        : "form-invalid-border";
    };
    const getErrorMessage = (attr) => {
      let err = this.state.errorMessage;
      return !err || !err[attr] || err[attr] === "" ? "" : err[attr][0];
    };

    return (
      <div className="MerchantInvoice">
        <h2 className="VisaBlue" id="header">
          Invoice Creation Form
        </h2>
        <Form onSubmit={this.handleSubmit}>
          <div id="invoiceRow">
            <div className="form-field" id="center">
              <Form.Control
                className={getFormClass("businessName")}
                name="businessName"
                placeholder="Business name"
                onChange={this.handleChange}
              />
              <label className="text-danger form-invalid-feedback">
                {getErrorMessage("businessName")}
              </label>
            </div>
          </div>
          <div id="invoiceRow">
            <div className="form-field" id="center">
              <Form.Control
                className={getFormClass("email")}
                name="businessEmail"
                placeholder="Business email"
                onChange={this.handleChange}
              />
              <label className="text-danger form-invalid-feedback">
                {getErrorMessage("email")}
              </label>
            </div>
          </div>
          <div id="invoiceRow">
            <textarea
              className="form-control"
              name="additionalMessage"
              placeholder="Additional Message"
              onChange={this.handleChange}
              rows="5"
            ></textarea>
          </div>
          <div id="invoiceRow">
            <ItemsListForm
              action={this.handleItemsChange}
              items={this.state.items}
              errorMessage={this.state.errorMessage}
            />
          </div>

          <div className="buttonsRow">
            <Button
              variant="primary"
              type="submit"
              id="buttonBlue"
              onClick={this.handleSubmit}
            >
              <span id="submitText">Submit</span>
              <span id="goldenArrow">➤</span>
            </Button>
          </div>
          <br></br>
          <br></br>
          <h1 className="smallVisaBlue">Alias: {this.state.alias}</h1>
        </Form>
      </div>
    );
  }
}

export default withRouter(MerchantInvoice);
