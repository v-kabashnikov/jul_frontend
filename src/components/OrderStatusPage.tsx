import React from "react";
import Cable from "actioncable";
import { API_WS_ROOT, API_ROOT } from "../constants";
import { Image } from "react-bootstrap";
import logo from "./placeholder.png"

export type Item = {
  id: string;
  name: string;
  quantity: number;
};

export type Order = {
  id: string;
  name: string;
  company_address: string;
  pickup_point: string;
  status: {};
  items: Array<Item>;
};

export type State = {
  order: Order;
};

export class OrderStatusPage extends React.Component {
  state: State = {
    order: {
      id: "",
      name: "",
      company_address: "",
      pickup_point: "",
      status: {
        received: "",
        packing: "",
        delivering: "",
        complete: ""
      },
      items: []
    }
  };

  orderId: number = 3;

  componentDidMount = () => {
    this.orderId = Number.parseInt(window.location.pathname.substr(1));
    let cable = Cable.createConsumer(API_WS_ROOT);
    cable.subscriptions.create(
      {
        channel: "OrdersChannel",
        //TODO
        id: this.orderId
      },
      {
        connected: () => {
          console.log("connected");
        },
        received: (data: Order) => {
          this.UpdateOrderStatus(data);
        },
        disconnected: () => {
          console.log("disconnected");
        }
      }
    );
    this.fetchOrderStatus();
  };

  UpdateOrderStatus = (response: Order) => {
    console.log(response);
    this.setState({ order: response });
  };

  fetchOrderStatus = () => {
    //TODO order
    fetch(`${API_ROOT}/orders/${this.orderId}`)
      .then(res => res.json())
      .then(order => this.setState({ order }));
  };

  renderStatus = () => {
    let result: any = [];
    Object.entries(this.state.order.status).forEach(
      ([step, stepStatus], index) => {
        let progress: string = "";
        if (stepStatus === "completed") {
          progress = "is-complete";
        } else if (stepStatus === "current") {
          progress = "is-current";
        }
        result.push(
          <li key={index} className={"ProgressBar-step " + progress}>
            <svg className="ProgressBar-icon" />
            <span className="ProgressBar-stepLabel">{step}</span>
          </li>
        );
      }
    );
    return result;
  };

  renderItems = (items: Item[]) => {
    let result: any = [];
    items.forEach((item: Item, index) => {
      result.push(
        <p key={index} className="item-description">
          {item.quantity}x {item.name}
        </p>
      );
    });
    return result;
  };

  renderIntro = () => {
    const entries = Object.entries(this.state.order.status);
    const current_step = entries.filter(p => p[1] === "current");
    if (current_step.length > 0) {
      return (
        <h1 className="intro">
          We are currently {current_step[0][0]} your order
        </h1>
      );
    } else {
      return <h1 className="intro">We don't know</h1>;
    }
  };

  render = () => {
    const { order } = this.state;
    return (
      <div>
        <div className="order">
          <div className="wrapper">
            <ol className="ProgressBar">{this.renderStatus()}</ol>
          </div>
        </div>
        <section className="order-details">
          <div className="container">
            <div className="logo">
              <Image src={logo} fluid />
            </div>
            {this.renderIntro()}
            <div className="report">
              <div className="order-pieces">
                <div className="item">
                  <a href="/" className="link">
                    order info
                  </a>
                  <p className="item-name">Order ID</p>
                  <p className="item-description">{order.id}</p>
                </div>
                <div className="item">
                  <p className="item-name">Items Ordered:</p>
                  {this.renderItems(order.items)}
                </div>
                <div className="item">
                  <p className="item-name">Name, Surname:</p>
                  <p className="item-description">{order.name}</p>
                </div>
                <div className="item">
                  <p className="item-name">Company Address:</p>
                  <p className="item-description">{order.company_address}</p>
                </div>
                <div className="item">
                  <p className="item-name">Pickup point</p>
                  <p className="item-description">{order.pickup_point}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };
}
